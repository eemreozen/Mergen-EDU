from app.schemas.discovery import FollowupPlan


async def test_discovery_reviews_other_answer_and_adds_targeted_choices(client, app, project_id, monkeypatch):
    calls = []

    async def review(operation, system, payload, schema):
        assert operation == "discovery"
        calls.append(payload)
        if len(calls) == 1:
            return FollowupPlan(questions=[{
                "text": "Ürün ilk aşamada kimler tarafından kullanılacak?",
                "type": "multi_choice",
                "options": ["Bireysel kullanıcılar", "Kurum çalışanları", "Danışmanlar"],
                "targetField": "projectDetailAudienceFollowup",
                "parentQuestionId": "project-detail-0",
            }])
        return FollowupPlan(questions=[])

    monkeypatch.setattr(app.state.gateway, "generate_structured", review)
    view = (await client.get(f"/api/v1/projects/{project_id}/discovery")).json()
    first = next(q for q in view["questions"] if q["section"] == "project")
    assert {"other", "recommend"} <= set(first["options"])
    for invalid in ("other", "other:   "):
        response = await client.post(f"/api/v1/projects/{project_id}/discovery/answers", json={
            "answers": [{"questionId": first["id"], "value": invalid}]
        })
        assert response.status_code == 422
    answers = [{"questionId": q["id"], "value": (
        "other:Çevrimdışı çalışan ve kurum içinde paylaşılan bir araç"
        if q["id"] == first["id"] else "6" if q["targetField"] == "weeklyHours"
        else q["options"][0] if q["options"] else "Python"
    )} for q in view["questions"] if q["required"]]
    result = await client.post(f"/api/v1/projects/{project_id}/discovery/answers", json={"answers": answers})
    assert result.status_code == 200, result.text
    assert not result.json()["readyForRoadmap"]
    followup = result.json()["nextQuestion"]
    assert followup["type"] == "multi_choice"
    assert followup["parentQuestionId"] == first["id"]
    assert len(followup["options"]) == 5
    assert calls[0]["answers"][first["targetField"]].startswith("other:Çevrimdışı")
    assert calls[0]["originalIdea"] and calls[0]["locale"] == "tr"
    assert (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).status_code == 409
    result = await client.post(f"/api/v1/projects/{project_id}/discovery/answers", json={
        "answers": [{"questionId": followup["id"], "value": ["Kurum çalışanları", "Danışmanlar"]}]
    })
    assert result.status_code == 200, result.text
    assert result.json()["readyForRoadmap"]
    assert len(calls) == 2
    await client.post(f"/api/v1/projects/{project_id}/discovery/answers", json={"answers": answers})
    assert len(calls) == 2


async def test_initial_discovery_supports_more_than_two_decision_axes(client, app, monkeypatch):
    original = app.state.gateway.generate_structured

    async def analyze(operation, system, payload, schema):
        result = await original(operation, system, payload, schema)
        result.discovery_questions = [
            result.discovery_questions[0].model_copy(update={
                "text": text, "target_field": field,
                "options": options, "type": "single_choice",
            }) for text, field, options in [
                ("Ürün nerede kullanılacak?", "projectDetailEnvironment", ["Evde", "İş yerinde", "Sahada"]),
                ("İlk sürüm kimlere hizmet edecek?", "projectDetailAudience", ["Bireyler", "Küçük ekipler", "Kurumlar"]),
                ("İlk sürüm hangi işi kolaylaştıracak?", "projectDetailActivity", ["Planlama", "Kayıt tutma", "Analiz"]),
                ("Bilgiler sisteme nasıl gelecek?", "projectDetailInput", ["Elle girilecek", "Dosyadan alınacak", "Cihazdan gelecek"]),
            ]
        ]
        return result

    monkeypatch.setattr(app.state.gateway, "generate_structured", analyze)
    created = await client.post("/api/v1/projects", json={"idea": "Üretim takibini kolaylaştıran bir ürün geliştirmek istiyorum."})
    assert created.status_code == 201, created.text
    view = (await client.get(f"/api/v1/projects/{created.json()['id']}/discovery")).json()
    project_questions = [q for q in view["questions"] if q["section"] == "project"]
    assert len(project_questions) == 4
    assert all(len(q["options"]) == 5 for q in project_questions)
