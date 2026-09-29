रोजचा जमा खर्च अहवाल — Core Foundation
Version: 1.0.0

या फोल्डरमध्ये:
- index.html
- style.css
- app.js
- manifest.json
- service-worker.js

सुरू करण्यासाठी:
1. सर्व फाइल्स एकाच फोल्डरमध्ये ठेवा.
2. Browser मध्ये चालवण्यासाठी local web server किंवा HTTPS hosting वापरा.
3. PWA install आणि offline cache साठी service worker HTTPS/localhost वर चालतो.
4. अ‍ॅपचा डेटा त्या browser/device च्या LocalStorage मध्ये साठवला जातो.

नवीन LocalStorage keys:
RJKA_v1_transactions
RJKA_v1_accounts
RJKA_v1_budgets
RJKA_v1_lending
RJKA_v1_workplan
RJKA_v1_settings

टीप:
ही पहिली Core Foundation आवृत्ती आहे. Dashboard, navigation, default accounts आणि storage foundation कार्यरत आहेत.
Income, Expense, Accounts management, Budgets, Lending, Work Plan आणि Reports चे पूर्ण forms पुढील टप्प्यात जोडायचे आहेत.
