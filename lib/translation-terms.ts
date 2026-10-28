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
