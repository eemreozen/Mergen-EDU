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
            discoveryQuestions=[
                dict(text=text, type="short_text", options=[], targetField=field)
                for text, field in [
                    ("Bu uygulamanın ilk kullanıcıları kimler olacak?", "projectDetailAudience"),
                    ("İlk sürümde mutlaka çalışması gereken üç özellik nedir?", "projectDetailFeatures"),
                    ("Hangi verileri kullanacaksın ve bu veriler hazır mı?", "projectDetailData"),
                    ("Projenin başarılı olduğunu nasıl anlayacaksın?", "projectDetailSuccess"),
                ]
            ],
            mvpSuggestions=["Küçük çalışan prototip"],
        )
    if operation == "discovery":
        return {"questions": []}
    if operation == "adaptive_roadmap":
        skills = payload["weakSkills"]
        nodes = []
        for index, skill in enumerate(skills):
            for suffix, label in [("learn", "Temeller"), ("practice", "Uygulama")]:
                nodes.append(
                    dict(
                        key=f"skill-{index}-{suffix}",
                        title=f"{skill} — {label}",
                        type="learning",
                        summary=f"{skill} becerisini projen içinde uygulayarak öğren.",
                        skills=[skill],
                        estimatedHours=1,
                    )
                )
        return dict(
            title=payload["node"]["title"] + " — Öğrenme Dalı",
            description="Eksik becerilere özel kalıcı öğrenme haritası.",
            nodes=nodes,
            edges=[
                dict(source=nodes[i]["key"], target=nodes[i + 1]["key"], kind="requires")
                for i in range(len(nodes) - 1)
            ],
        )
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
            entries.extend(
                [
                    ("requirements", "Kullanıcı Senaryoları", "learning", ["product.requirements"]),
                    ("architecture", "Uygulama Mimarisi", "learning", ["architecture.basics"]),
                    ("data_model", "Veri Modeli", "learning", ["data.modeling"]),
                    ("auth", "Kimlik ve Yetkilendirme", "learning", ["auth.basics"]),
                    ("features", "Temel Özellikler", "development_task", ["feature.implementation"]),
                    ("validation", "Veri Doğrulama", "learning", ["validation.basics"]),
                    ("monitoring", "Hata İzleme", "learning", ["monitoring.basics"]),
                    ("delivery", "Dağıtım Hazırlığı", "development_task", ["deployment.basics"]),
                ]
            )
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
                ("basics", "requirements"),
                ("requirements", "architecture"),
                ("architecture", "data_model"),
                ("data_model", "auth"),
                ("auth", "features"),
                ("features", "validation"),
                ("validation", "integration"),
                ("testing", "monitoring"),
                ("monitoring", "delivery"),
                ("delivery", "mvp"),
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
            lesson="Bu örnek derste konuyu küçük ve doğrulanabilir adımlara ayırırız. Önce girdiyi, yapılacak işlemi ve beklenen çıktıyı belirle. Örneğin bir kullanıcı verisini işlerken boş girdiyi ayrı ele al, geçerli girdiyi dönüştür ve sonucu doğrula. Küçük bir fonksiyon yazıp normal girdi ve sınır durumlarıyla dene. Sık yapılan hata tüm işi tek adımda yazmaktır; her adımın çıktısını kontrol ederek ilerle. Şimdi kendi projen için bir girdi seç ve beklenen sonucu önceden yaz.",
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
    if operation == "memory_review":
        variant = (
            "Başka bir girdide"
            if payload.get("previousQuestion", "") and not payload["previousQuestion"].startswith("Başka")
            else "Projene yeni bir özellik eklerken"
        )
        return dict(
            question=dict(
                id="memory-question",
                prompt=f"{variant} {payload['skill']} için sonucun doğru olduğunu nasıl kontrol edersin?",
                options=["Beklenen sonucu belirleyip küçük bir testle", "Tahmin ederek", "Kontrol etmeden"],
                correctIndex=0,
                explanation="Önce beklenen sonucu belirlemek ve küçük bir örnekte sınamak hatayı görünür kılar.",
                targetSkill=payload["skill"],
                difficulty="beginner",
            ),
            refresher="Konuyu baştan öğrenmene gerek yok. Girdiyi ve beklediğin çıktıyı yaz; işlemi küçük adımlara böl. Her adımın sonucunu tek bir örnekle kontrol et. Bu tekrar sorusu yalnız demo fixture içindir.",
            miniExercise="Projenden bir örnek girdi seç. Beklenen çıktıyı yaz ve tek bir sınır durumu ekleyerek kontrol et.",
        )
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
