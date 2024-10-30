
# disable_billing_in-gcp

A small Cloud Function used together with a budget and a pub/sub to cap costs and stop usage for a project by disabling Cloud Billing.

Working with GCP for educational purposes can be an expensive affair if you forget to turn off resources you create.

This small project contains a small node function that can be set up as a Cloud Function which together with a Cloud Budget and a Pub / Sub can be used to automatically turn off Cloud Billing for a project.

Read more in this tutorial from Google:
https://cloud.google.com/billing/docs/how-to/notify#cap_disable_billing_to_stop_usage
