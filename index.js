import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION, Session, BillingInterval } from '@shopify/shopify-api';
import express, { urlencoded } from 'express';

async function billingMiddleware(req, res, next) {
    const sessionId = await shopify.session.getCurrentId({
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
    });
    const session = new Session(sessionStorage.find(s => s.id === sessionId));
    // console.log(sessionStorage, sessionId);
    const hasPayment = await shopify.billing.check({
        session,
        plans: ['My billing plan'],
        isTest: true,
    });
 
    if (hasPayment) {
        next();
    } else {
        // Either request payment now (if single plan) or redirect to plan selection page (if multiple plans available), e.g.
        const confirmationUrl = await shopify.billing.request({
            session,
            plan: 'My billing plan',
            isTest: true,
        });

        res.redirect(confirmationUrl);
    }
}


const shopify = shopifyApi({
    // The next 4 values are typically read from environment variables for added security
    apiKey: 'fd3916b844cbc935b7358a3f28458ff6',
    apiSecretKey: '2ec3700f351f9a6e89d432fb168a6d8f',
    hostName: 'localhost:3000',
    apiVersion: LATEST_API_VERSION,
    scopes: ['read_products'],
    isEmbeddedApp: false,
    hostScheme: 'http',
    billing: {
        'My billing plan': {
            interval: BillingInterval.OneTime,
            amount: 30,
            currencyCode: 'USD'
            // replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
            // discount: {
            //     durationLimitInIntervals: 3,
            //     value: {
            //         amount: 10
            //     }
            // }
        }
    } 
});
const app = express();


const sessionStorage = [];

app.get('/auth', async (req, res) => {
    // The library will automatically redirect the user
    await shopify.auth.begin({
        shop: shopify.utils.sanitizeShop('sealion4.myshopify.com', true),
        callbackPath: '/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
    });
});



app.get('/auth/callback', async (req, res) => {
    console.log(req.query);
    const callback = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res
    });
    sessionStorage.push(callback.session.toObject());
    res.redirect('/');
});


app.get('/', billingMiddleware, async (req, res) => {
    // const sessionId = await shopify.session.getCurrentId({
    //     isOnline: false,
    //     rawRequest: req,
    //     rawResponse: res, 
    // });

    // const session = new Session(sessionStorage.find(s => s.id === sessionId));
    // console.log(session);

 


    res.send('<h1 style="color: Navy; font-family: Arial; text-align: center;">Home Page</h1>');
});


app.listen(3000, () => console.log('Server Started'))