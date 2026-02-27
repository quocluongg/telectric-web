/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://telectric.vn', // Please replace with your actual domain
    generateRobotsTxt: true, // (optional)
    sitemapSize: 7000,
}
