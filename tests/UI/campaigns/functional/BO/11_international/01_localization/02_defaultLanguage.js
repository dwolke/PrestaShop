require('module-alias/register');

const {expect} = require('chai');

const helper = require('@utils/helpers');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const LocalizationPage = require('@pages/BO/international/localization');
const HomePage = require('@pages/FO/home');

// Import Data
const {Languages} = require('@data/demo/languages');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_international_localization_defaultLanguage';

let browserContext;
let page;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    localizationPage: new LocalizationPage(page),
    homePage: new HomePage(page),
  };
};
describe('Update default language', async () => {
  const tests = [
    {args: {language: Languages.french.name, defaultBrowserLanguage: false, languageToCheck: 'Français'}},
    {args: {language: Languages.english.name, defaultBrowserLanguage: false, languageToCheck: 'English'}},
    // To back to the default values
    {args: {language: Languages.english.name, defaultBrowserLanguage: true}},
  ];

  tests.forEach((test, index) => {
    describe(`Set default language to '${test.args.language}' and default language from browser to`
      + ` '${test.args.defaultBrowserLanguage}'`, async () => {
      before(async function () {
        browserContext = await helper.createBrowserContext(this.browser);
        page = await helper.newTab(browserContext);

        this.pageObjects = await init();
      });

      after(async () => {
        await helper.closeBrowserContext(browserContext);
      });
      loginCommon.loginBO();

      it('should go to \'International > localization\' page', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToLocalizationPage_${index}`, baseContext);

        await this.pageObjects.dashboardPage.goToSubMenu(
          this.pageObjects.dashboardPage.internationalParentLink,
          this.pageObjects.dashboardPage.localizationLink,
        );

        const pageTitle = await this.pageObjects.localizationPage.getPageTitle();
        await expect(pageTitle).to.contains(this.pageObjects.localizationPage.pageTitle);
      });

      it('should set \'Default language\' and \'Set language from browser\'', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `setDEfaultLanguage_${index}`, baseContext);

        const textResult = await this.pageObjects.localizationPage.setDefaultLanguage(
          test.args.language,
          test.args.defaultBrowserLanguage,
        );

        await expect(textResult).to.equal('Update successful');
      });
    });

    // Do not check the FO language when index = 2
    if (index !== 2) {
      describe(`Check if the FO language is '${test.args.languageToCheck}'`, async () => {
        before(async function () {
          browserContext = await helper.createBrowserContext(this.browser);
          page = await helper.newTab(browserContext);

          this.pageObjects = await init();
        });

        after(async () => {
          await helper.closeBrowserContext(browserContext);
        });

        it('should open the shop page', async function () {
          await testContext.addContextItem(this, 'testIdentifier', `openShop_${index}`, baseContext);

          await this.pageObjects.homePage.goTo(global.FO.URL);
          const isHomePage = await this.pageObjects.homePage.isHomePage();
          await expect(isHomePage).to.be.true;
        });

        it('should go to FO and check the language', async function () {
          await testContext.addContextItem(this, 'testIdentifier', `checkLanguageInFO_${index}`, baseContext);

          const defaultLanguage = await this.pageObjects.homePage.getShopLanguage();
          expect(defaultLanguage).to.equal(test.args.languageToCheck);
        });
      });
    }
  });
});
