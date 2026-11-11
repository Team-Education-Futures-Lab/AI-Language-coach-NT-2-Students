# Nederlandse spellen en 8-bit presentatie — 11 november 2026

Alle taalspellen krijgen een afgebakende Nederlandse vertaalcontext, inclusief de taalquiz, woordzoeker en de drie taaluitdagingen. De app zelf behoudt de profieltaal. Portaldialogen hebben expliciet lang=nl, dir=ltr en translate=no. De vertaalcontext voorkomt tevens vertaal-API-aanvragen voor spelwoorden en antwoordopties.

Woordenwereld, Taalrally en Woordenkosmos delen een nieuwe pixelrenderer met handgeschreven sprites, gelaagde stadsachtergrond, gras/bakstenen, auto's met raam- en lichtdetails, bermen/verkeersborden, planeten, rotsen en projectielen. Geen externe afbeeldingen of lettertypedownloads. De spelkaarten tonen een eigen preview. Bestaande besturing, botsingen, score en voortgang zijn behouden.

Web Audio maakt originele chiptunemelodieën (een per spel), afzonderlijke spring-, land-, laser-, verzamel- en botsgeluiden en eindmelodieën. Geluid vereist expliciete inschakeling, muziek is apart te kiezen, het volume is begrensd. Pauze, vensterverlies, dempen en sluiten stoppen muziek en geplande geluiden; weggaan ruimt de AudioContext op. Geen audio-, microfoon- of netwerkdiensten nodig.

Validatie: 102 automatische tests inclusief geluidsopt-in, stoppen van geluidsbronnen en pixelrendering. Chromium-browserchecks met Engelse en Arabische appinstelling: uitdagingen en hun pop-ups blijven Nederlands/LTR. Extra geïntegreerde check van Nederlandse quizvragen, antwoordopties en woordzoeker onder Engels. De drie actiespellen zijn visueel geïnspecteerd; muziekinschakeling, pauze/hervatten, sluiten, dempen, beweging en mobiele overflow zijn gecontroleerd. Audiogebeurtenissen zijn geverifieerd via de browser, niet via een test op fysieke luidsprekers of alle mobiele apparaten.
