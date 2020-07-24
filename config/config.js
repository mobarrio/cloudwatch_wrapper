// ============================
//  General Properties
// ============================
let get = {
    auth: {
        scopes: {
            basic: 'monitoring',
        },
        exclude: ['/', '/about', '/health', '/api/v1/health', '/auth', '/auth/get/credentials', '/auth/get/credentials/forever' ]
    }
};

module.exports = get;
