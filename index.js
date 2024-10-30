const {CloudBillingClient} = require('@google-cloud/billing');
const google_compute = require('googleapis/build/src/apis/compute');
const {GoogleAuth} = require('google-auth-library');

const PROJECT_ID = 'continual-tine-439707-p0';
//const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billing = new CloudBillingClient();

exports.stopBilling = async pubsubEvent => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );

  console.log("------------------------------------------------------------------");
  console.log(`BudgetDisplayName: ${pubsubData.budgetDisplayName}`);
  console.log("------------------------------------------------------------------");

  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    console.log(`Allt är lugnt, kostnaden är under kontroll. (Current cost: ${pubsubData.costAmount} -- Current budget: ${pubsubData.budgetAmount})`);
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    return;
  }

  console.log(`Kostnaden har överskridit budgeten. (Current cost: ${pubsubData.costAmount} -- Current budget: ${pubsubData.budgetAmount})`);
  if (!PROJECT_ID) {
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    return 'No project specified';
  }

  _setAuthCredential();
  const billingEnabled = await _isBillingEnabled(PROJECT_NAME);
  if (billingEnabled) {
    return _disableBillingForProject(PROJECT_NAME);
  } else {
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    console.log("------------------------------------------------------------------");
    return 'Billing already disabled';
  }
};

/**
 * @return {Promise} Credentials set globally
*/
const _setAuthCredential = () => {
  const client = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });

  // Set credentials
  google_compute.auth = client;
};


/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async projectName => {
  try {
    console.log(
      'Is billing enabled on:', projectName, '?'
    );
    const [res] = await billing.getProjectBillingInfo({name: projectName});
    return res.billingEnabled;
  } catch (e) {
    console.log(
        'Exception (e): ', e
      );
    console.log(
      'Unable to determine if billing is enabled on specified project, assuming billing is enabled'
    );
    return true;
  }
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 * @return {string} Text containing response from disabling billing
*/ 
const _disableBillingForProject = async projectName => {
  const [res] = await billing.updateProjectBillingInfo({
    name: projectName,
    resource: {billingAccountName: ''}, // Disable billing
  });
  return `Billing disabled: ${JSON.stringify(res)}`;
};
