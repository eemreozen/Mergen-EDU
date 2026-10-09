"""Açıkça etiketlenmiş deterministik fixture; gerçek AI çıktısı değildir."""


def fixture(operation, payload):
    if operation == "project_analysis":
        idea = payload["idea"].lower()
        domain = (
            "game_dev"
            if any(s in idea for s in ["oyun", "game"])
            else "mobile"
            if any(s in idea for s in ["fitness", "mobil"])
            else "web"
        )
        secondary = ["ai_ml"] if any(s in idea for s in ["ai", "yapay", "model"]) else []
        return dict(
            title="AI Fitness App" if "fitness" in idea else payload["idea"][:100],
            goal=payload["idea"],
            primaryDomain=domain,
            secondaryDomains=secondary,
            projectType="mvp",
            requiredSkills=["programming.basics"],
            uncertainDecisions=["stack"],
            mvpSuggestions=["Küçük çalışan prototip"],
        )
    if operation == "discovery":
        return {"questions": []}
    if operation in {"roadmap", "submap"}:
        if operation == "roadmap":
            entries = [
                ("basics", "Programlama Temelleri", "learning", ["javascript.basics"]),
                ("mobile", "Mobil Geliştirme", "learning", ["mobile.basics"]),
                ("backend", "Backend", "learning", ["backend.api"]),
                ("ml", "Machine Learning", "submap", ["python.basics", "ml.basics"]),
                ("integration", "AI Entegrasyonu", "development_task", ["ai.integration"]),
                ("testing", "Test ve Yayınlama", "learning", ["testing.basics"]),
                ("mvp", "MVP Tamamlama", "milestone", ["project.mvp"]),
            ]
            if payload["project"]["primary_domain"] != "mobile":
                entries[1] = (
                    "domain",
                    "Alan Temelleri",
                    "learning",
                    [payload["project"]["primary_domain"] + ".basics"],
                )
            links = [
                ("basics", entries[1][0]),
                ("basics", "backend"),
                ("ml", "integration"),
                (entries[1][0], "integration"),
                ("backend", "integration"),
                ("integration", "testing"),
                ("testing", "mvp"),
            ]
        else:
            entries = [
                ("python", "Python", "learning", ["python.basics", "python.functions"]),
                ("functions", "Fonksiyonlar", "learning", ["python.functions"]),
                ("data", "NumPy/Pandas ve Veri Hazırlama", "learning", ["data.preparation"]),
                ("fundamentals", "ML Temelleri", "learning", ["ml.basics"]),
                ("training", "Model Eğitimi", "development_task", ["ml.training"]),
                ("evaluation", "Model Değerlendirme", "milestone", ["ml.evaluation"]),
            ]
            links = [(entries[i][0], entries[i + 1][0]) for i in range(len(entries) - 1)]
        return dict(
            title="Öğrenme Haritası" if operation == "roadmap" else payload["node"]["title"],
            description="Deterministik örnek harita; gerçek AI üretimi değildir.",
            nodes=[
                dict(
                    key=k,
                    title=t,
                    type=ty,
                    summary=f"{t} ile proje hedefin için pratik yap.",
                    skills=sk,
                    estimatedHours=3,
                )
                for k, t, ty, sk in entries
            ],
            edges=[dict(source=s, target=t, kind="requires") for s, t in links],
        )
    if operation == "node_content":
        title = payload["node"]["title"]
        return dict(
            whyNeeded=f"{payload['project']['goal']} hedefi için {title} gerekiyor.",
            learningObjectives=[f"{s} becerisini bir örnekle uygula." for s in payload["node"]["skills"]],
            subtopics=payload["node"]["skills"],
            practicalTask=dict(
                description=f"{title} için proje bağlamında küçük bir prototip yaz.",
                expectedOutput="Çalışan kod ve en az bir doğrulama örneği.",
            ),
        )
    if operation == "assessment":
        skills = payload["node"]["skills"]
        questions = []
        for i in range(max(3, len(skills))):
            skill = skills[i % len(skills)]
            if skill == "python.functions":
                prompt, options, correct, explanation = (
                    "Python'da fonksiyon tanımlamak için hangi anahtar kelime kullanılır?",
                    ["func", "function", "def", "fn"],
                    2,
                    "Python fonksiyonları def ile tanımlanır.",
                )
            elif skill == "python.basics":
                prompt, options, correct, explanation = (
                    "Python listeleri hangi parantezle gösterilir?",
                    ["[]", "{}", "()", "<>"],
                    0,
                    "Liste gösterimi köşeli parantez kullanır.",
                )
            elif skill == "javascript.basics":
                prompt, options, correct, explanation = (
                    "JavaScript içinde blok kapsamlı değişken hangi anahtar kelimeyle tanımlanır?",
                    ["let", "def", "class", "import"],
                    0,
                    "let blok kapsamında değişken tanımlar.",
                )
            else:
                prompt, options, correct, explanation = (
                    f"{skill} için pratik çıktını nasıl doğrularsın?",
                    [
                        "Beklenen çıktıya karşı test ederek",
                        "Hiç çalıştırmadan",
                        "Hataları yok sayarak",
                        "Rastgele değiştirerek",
                    ],
                    0,
                    "Beklenen çıktıya karşı test etmek doğrulama sağlar. Bu genel soru yalnızca demo fixture içindir.",
                )
            questions.append(
                dict(
                    id=f"q-{i}",
                    prompt=prompt,
                    options=options,
                    correctIndex=correct,
                    explanation=explanation,
                    targetSkill=skill,
                    difficulty="beginner",
                )
            )
        return dict(title=payload["node"]["title"] + " Değerlendirmesi", questions=questions)
    if operation == "advisor":
        failed = payload.get("lastAssessment", {})
        if failed.get("weakSkills") and not failed.get("passed"):
            reply = (
                ", ".join(failed["weakSkills"])
                + " becerisindeki yanlış cevapların nedeniyle ek pratik önerildi. Telafiyi tamamlayıp ana testi tekrar deneyebilirsin."
            )
        else:
            reply = "Proje hedefin için mevcut haritadaki açık duraktan başlayabilirsin."
        return dict(reply=reply, suggestedActions=[])
    raise ValueError(f"Unknown fixture: {operation}")
