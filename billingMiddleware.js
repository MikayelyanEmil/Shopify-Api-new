export default async function (req, res, next) {
    const sessionId = shopify.session.getCurrentId({
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
    });

    const session = new Session(sessionStorage.find(s => s.id === sessionId));

    const hasPayment = await shopify.billing.check({
        session,
        plans: ['My billing plan'],
        isTest: true,
    });

    if (hasPayment) {
        console.log('You have Paid');
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