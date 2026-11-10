import {coachTourSteps} from './coach-tour';
// Core interface vocabulary works without an AI request. Other UI translations are cached on the server.
const terms:Record<string,Record<string,string>>={
 en:{'Mijn leerplek':'My learning space','Oefeningen':'Exercises','AI-coach':'AI coach','Leeshoek':'Reading corner','Mijn voortgang':'My progress','Woordenboek':'Dictionary','Spelling':'Spelling','Begrijpend lezen':'Reading comprehension','Luisteren':'Listening','Schrijven':'Writing','Formuleren':'Expressing yourself','Alles':'All','Niveau':'Level','Bekijk of herhaal':'Review or repeat','Begin oefening':'Start exercise'},
 fa:{'Mijn leerplek':'فضای یادگیری من','Oefeningen':'تمرین‌ها','AI-coach':'مربی هوش مصنوعی','Leeshoek':'گوشهٔ مطالعه','Mijn voortgang':'پیشرفت من','Woordenboek':'واژه‌نامه','Spelling':'املا','Begrijpend lezen':'درک مطلب','Luisteren':'شنیدن','Schrijven':'نوشتن','Formuleren':'بیان و جمله‌بندی','Alles':'همه','Niveau':'سطح','Bekijk of herhaal':'مرور یا تکرار','Begin oefening':'شروع تمرین','EVEN IETS ANDERS':'کمی تنوع','Ook ontspannen is leren.':'استراحت هم فرصتی برای یادگیری است.','Ontdek de leeshoek':'گوشهٔ مطالعه را ببینید'},
 ar:{'Mijn leerplek':'مساحة تعلّمي','Oefeningen':'التمارين','AI-coach':'مدرّب الذكاء الاصطناعي','Leeshoek':'ركن القراءة','Mijn voortgang':'تقدّمي','Woordenboek':'القاموس','Spelling':'الإملاء','Begrijpend lezen':'فهم المقروء','Luisteren':'الاستماع','Schrijven':'الكتابة','Formuleren':'الصياغة','Alles':'الكل','Niveau':'المستوى','Bekijk of herhaal':'مراجعة أو تكرار','Begin oefening':'ابدأ التمرين'}
};
export const interfaceTranslation=(text:string,language:string)=>['taalcoach','AI','XP','Mbo','Hbo','Wo'].includes(text)?text:terms[language]?.[text];

const essentials:Record<string,string[]>={
 'Kies je taal':['Choose your language','اختر لغتك','زبانت را انتخاب کن','Dilini seç','Виберіть мову'],
 'Uitleg in jouw taal. Oefenen in het Nederlands.':['Explanations in your language. Practice in Dutch.','الشرح بلغتك، والتدريب باللغة الهولندية.','توضیحات به زبان تو، تمرین به زبان هلندی.','Açıklamalar senin dilinde, alıştırmalar Hollandaca.','Пояснення вашою мовою. Практика нідерландською.'],
 'Inloggen':['Log in','تسجيل الدخول','ورود','Giriş yap','Увійти'],
 'Account aanmaken':['Create account','إنشاء حساب','ساخت حساب','Hesap oluştur','Створити обліковий запис'],
 'Begin met leren':['Start learning','ابدأ التعلم','شروع یادگیری','Öğrenmeye başla','Почати навчання'],
 'Maak je leerprofiel':['Create your learning profile','أنشئ ملفك التعليمي','پروفایل یادگیری بساز','Öğrenme profilini oluştur','Створіть навчальний профіль'],
 'E-mailadres':['Email address','البريد الإلكتروني','ایمیل','E-posta adresi','Електронна пошта'],
 'Wachtwoord':['Password','كلمة المرور','رمز عبور','Şifre','Пароль'],
 'Je wachtwoord':['Your password','كلمة مرورك','رمز عبور شما','Şifren','Ваш пароль'],
 'Minimaal 8 tekens':['At least 8 characters','8 أحرف على الأقل','حداقل ۸ نویسه','En az 8 karakter','Щонайменше 8 символів'],
 'Student':['Student','طالب','زبان‌آموز','Öğrenci','Студент'],
 'Docent':['Teacher','معلّم','مدرس','Öğretmen','Викладач'],
 'Naar mijn leerplek':['Go to my learning space','إلى مساحة تعلّمي','ورود به فضای یادگیری','Öğrenme alanıma git','До мого навчального простору'],
 'Welkom terug.':['Welcome back.','مرحبًا بعودتك.','خوش برگشتی.','Tekrar hoş geldin.','З поверненням.'],
 'Opnieuw proberen':['Try again','حاول مجددًا','دوباره امتحان کن','Tekrar dene','Спробувати ще раз'],
 'Sluiten':['Close','إغلاق','بستن','Kapat','Закрити'],
 'Typen':['Type','كتابة','نوشتن','Yaz','Писати'],
 'Bellen':['Call','محادثة صوتية','گفت‌وگوی صوتی','Sesli konuş','Голосова розмова'],
 'Start gesprek':['Start conversation','ابدأ المحادثة','شروع گفت‌وگو','Konuşmayı başlat','Почати розмову'],
 'Jouw taal + Nederlands':['Your language + Dutch','لغتك + الهولندية','زبان تو + هلندی','Senin dilin + Hollandaca','Ваша мова + нідерландська'],
 'Klaar om te praten':['Ready to talk','جاهز للمحادثة','آمادهٔ گفت‌وگو','Konuşmaya hazır','Готовий до розмови'],
 'Ik luister naar je':['Listening to you','أنا أستمع إليك','دارم گوش می‌دهم','Seni dinliyorum','Я вас слухаю'],
 'Je coach denkt mee':['Your coach is thinking','مدرّبك يفكّر معك','مربی‌ات دارد فکر می‌کند','Koçun düşünüyor','Ваш наставник обмірковує відповідь'],
 'Je coach spreekt':['Your coach is speaking','مدرّبك يتحدث','مربی‌ات دارد صحبت می‌کند','Koçun konuşuyor','Ваш наставник говорить'],
 'Spreek één bericht':['Record a message','سجّل رسالة','ضبط یک پیام','Sesli mesaj kaydet','Записати повідомлення'],
 'Voorlezen':['Read aloud','القراءة بصوت عالٍ','خواندن با صدا','Sesli oku','Прочитати вголос'],
 'Ik wil reageren':['Let me respond','أريد الرد','می‌خواهم پاسخ بدهم','Yanıt vermek istiyorum','Хочу відповісти'],
 'Hulp nodig?':['Need help?','تحتاج إلى مساعدة؟','کمک می‌خواهی؟','Yardım ister misin?','Потрібна допомога?'],
 'Samen uitzoeken':['Let’s work it out','لنكتشف ذلك معًا','با هم بررسی کنیم','Birlikte çözelim','Розберімося разом'],
 'Één stap tegelijk':['One step at a time','خطوة واحدة في كل مرة','هر بار یک قدم','Adım adım','Крок за кроком'],
 'Leer Nederlands in jouw taal.':['Learn Dutch with help in your language.','تعلّم الهولندية مع شرح بلغتك.','هلندی را با توضیحات به زبان خودت یاد بگیر.','Kendi dilinde destek alarak Hollandaca öğren.','Вивчайте нідерландську з поясненнями вашою мовою.'],
 'Begin met oefenen':['Start practising','ابدأ التدريب','شروع تمرین','Alıştırmaya başla','Почати практику'],
 'Kies een oefening. Lees de uitleg in jouw taal. Oefen in het Nederlands. Je coach helpt je als je vastloopt.':['Choose an exercise. Read the instructions in your language. Practise Dutch. Your coach helps when you get stuck.','اختر تمرينًا واقرأ الشرح بلغتك. تدرّب باللغة الهولندية. يساعدك المدرّب عندما تواجه صعوبة.','یک تمرین انتخاب کن. توضیحات را به زبان خودت بخوان و به هلندی تمرین کن. اگر گیر کردی، مربی کمکت می‌کند.','Bir alıştırma seç. Açıklamayı kendi dilinde oku. Hollandaca pratik yap. Takıldığında koçun yardımcı olur.','Оберіть вправу. Прочитайте пояснення вашою мовою. Практикуйте нідерландську. Наставник допоможе, якщо виникнуть труднощі.'],
};
for(const [text,translations] of Object.entries(essentials))['en','ar','fa','tr','uk'].forEach((language,i)=>{(terms[language]??={})[text]=translations[i]});

Object.assign(terms.en,{'Vraag gerust uitleg in jouw taal. We oefenen Nederlands, één zin tegelijk.':'Ask for help in your language. We practise Dutch, one sentence at a time.','Mijn oefendoelen':'My practice goals'});
Object.assign(terms.ar,{'Vraag gerust uitleg in jouw taal. We oefenen Nederlands, één zin tegelijk.':'اطلب الشرح بلغتك. نتدرّب على الهولندية، جملة واحدة في كل مرة.','Mijn oefendoelen':'أهداف التدريب'});
Object.assign(terms.fa,{'Vraag gerust uitleg in jouw taal. We oefenen Nederlands, één zin tegelijk.':'به زبان خودت سؤال بپرس. هلندی را هر بار یک جمله تمرین می‌کنیم.','Mijn oefendoelen':'هدف‌های تمرین من'});

// The first tour works in English and Arabic even before an AI translation returns.
const tourCopy:Record<string,[string,string]>={
 'Start met één oefening':['Start with one exercise','ابدأ بتمرين واحد'],
 'Hier staat een oefening voor jou. Je ziet het niveau en de tijd. Klik op Start oefening om te beginnen.':['Here is an exercise for you. You can see its level and time. Select Start exercise to begin.','هنا تمرين لك. ترى المستوى والوقت. اضغط على بدء التمرين لتبدأ.'],
 'Mijn niveau':['My level','مستواي'],
 'Hier zie je jouw niveau. Nieuw? Begin bij A1. Doe de korte taalcheck als je niet weet wat bij je past. Je docent kan je niveau aanpassen.':['Here is your level. New to Dutch? Start at A1. Try the short language check if you are unsure. Your teacher can change your level.','هنا ترى مستواك. هل بدأت تعلم الهولندية حديثًا؟ ابدأ بالمستوى A1. جرّب اختبار اللغة القصير إذا لم تعرف مستواك. يمكن لمعلمك تعديل مستواك.'],
 'Vraag mij om hulp':['Ask me for help','اطلب مساعدتي'],
 'Je kunt met mij typen of praten. Bij een oefening klik je op Hulp nodig? Ik geef een tip. Jij probeert het antwoord zelf.':['You can type or talk to me. In an exercise, select Need help? I give a hint. You try the answer yourself.','يمكنك الكتابة أو التحدث معي. في التمرين، اضغط على هل تحتاج مساعدة؟ أعطيك تلميحًا. وأنت تحاول الإجابة بنفسك.'],
 'Mijn voortgang':['My progress','تقدمي'],
 'Hier zie je wat je vandaag hebt gedaan. In Mijn voortgang zie je al je oefeningen. Fouten maken mag. Zo leer je!':['Here is what you did today. My progress shows all your exercises. Mistakes are OK. They help you learn!','هنا ترى ما فعلته اليوم. في صفحة تقدمي ترى كل تمارينك. لا بأس بالأخطاء. هكذا تتعلم!'],
 'Start rondleiding':['Start tour','ابدأ الجولة'],
 'Overslaan':['Skip','تخطَّ'],
 'Volgende':['Next','التالي'],
 'Terug':['Back','رجوع'],
 'Start oefening':['Start exercise','ابدأ التمرين'],
 'Bekijk de rondleiding':['Show the tour','شاهد الجولة'],
 'Wat gaan we vandaag leren?':['What will we learn today?','ماذا سنتعلم اليوم؟'],
 'Deze oefening past bij jouw niveau.':['This exercise matches your level.','هذا التمرين يناسب مستواك.'],
 'Dit onderwerp was nog lastig. We oefenen het nog een keer.':['This topic was difficult. Let’s practise it again.','كان هذا الموضوع صعبًا. لنتدرّب عليه مرة أخرى.']
};
for(const [text,values] of Object.entries(tourCopy))['en','ar'].forEach((language,i)=>{(terms[language]??={})[text]=values[i]});

for(const step of coachTourSteps){terms.en[step.title]=step.en[0];terms.en[step.body]=step.en[1]}
