# QuoteKit IL

כלים חינמיים בעברית: מחשבון הצעת מחיר עם מע"מ לעצמאים בישראל (עוסק מורשה ועוסק פטור), הדפסה ל-PDF, תבנית CSV להורדה, חמישה צ'קליסטים להדפסה לקבלת דירה ושלושה מדריכים קצרים.

Free Hebrew tools: a quote and VAT calculator for Israeli freelancers (Hebrew/English toggle), a downloadable CSV template, five printable apartment checklists and three short guides.

Layout: `index.html` is the home hub; the calculator lives in `quote/` (`app.js`, `style.css`, `payment.config.json`, `quote-template.csv`); checklists in `dira/`; shared styles in `site.css`.

- זו הצעת מחיר, לא חשבונית מס, וגם לא ייעוץ משפטי או ייעוץ מס. שיעור המע"מ קבוע (18%) ומוגדר פעם אחת, בקבוע `VAT_RATE` בקובץ `quote/app.js`. עוסק פטור מחושב ללא מע"מ.
- This is a **quote / pricing worksheet, not a tax invoice (חשבונית מס)** and not legal or tax advice. VAT is a fixed 18%, set once as `VAT_RATE` in `quote/app.js`; exempt dealers get 0.
- התבנית חינם. אם היא חסכה לך זמן, אפשר לפרגן ב-₪4 דרך PayPal.me. לא חובה.
- The template is free; an optional tip (Hebrew UI: 4 ILS, English UI: $1) goes through PayPal.me. Payment URLs are allowlisted in `quote/app.js` and set in `quote/payment.config.json`. The checklists allow only the 10 ILS PayPal.me link (`dira/dira.js`).
- אין חשבון, אין שרת, אין מעקב של צד שלישי. אירועי שימוש נשמרים רק בדפדפן שלך (localStorage) ולא נשלחים לשום מקום.
- No account, no backend, no third-party tracking. Usage events stay in the visitor's browser.
