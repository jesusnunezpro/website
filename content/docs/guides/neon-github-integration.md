---
title: The Neon GitHub integration
subtitle: Connect Neon Postgres to a GitHub repository and build GitHub Actions workflows
enableTableOfContents: true
redirectFrom:
  - /docs/guides/neon-github-app
updatedOn: '2024-06-14T07:55:54.401Z'
---

<Admonition type="comingSoon" title="Feature Coming Soon">
The Neon GitHub integration is currently in **private preview**. To start using it, request access by contacting our [Customer Success](mailto:customer-success@neon.tech) team and asking to join the private preview.
</Admonition>

The Neon GitHub integration installs a GitHub App that links your Neon project to a GitHub repository and provides a sample GitHub Actions workflow that automatically creates a database branch for each pull request. You can expand on this workflow to develop more complex processes or customize it to suit your specific needs. 

This guide walks you through the following steps:

- Installing the GitHub App
- Connecting a Neon project to a GitHub repository
- Adding a GitHub Actions workflow to your repository

## Prerequisites

The steps described below assume the following:

- You have a Neon account and project. If not, see [Sign up for a Neon account](/docs/get-started-with-neon/signing-up).
- You have a GitHub account and a repository that you want to connect to your Neon project.

## Install the GitHub App and connect your Neon project

To get started:

1. In the Neon Console, navigate to the **Integrations** page in your Neon project.
2. Locate the **GitHub** card and click **Add**.
   ![GitHub App card](/docs/guides/github_card.png)
3. On the **GitHub** drawer, click **Install GitHub App**.
4. If you have more than one GitHub account, select the account where you want to install the GitHub app.
5. Select whether to install and authorize the GitHub app for **All repositories** in your GitHub account or **Only select repositories**.
   - Selecting **All repositories** authorizes the app on all repositories in your GitHub account, meaning that you will be able to connect your Neon project to any of them.
   - Selecting **Only select repositories** authorizes the app on one or more repositories, meaning that you will only be able to connect your Neon project to the selected repositories (you can authorize additional repositories later if you need to).
6. If you authorized the app on **All repositories** or multiple repositories, select a GitHub repository to connect to the current Neon project, and click **Connect**. If you authorized the GitHub app on a single GitHub repository, this step is already completed for you.

   You are advanced to the **Actions** tab on the final page of the setup, where you are provided with a sample GitHub Actions workflow that you can copy to your GitHub repository to set up a basic database branching workflow. For instructions, see [Add the GitHub Actions workflow to your repository](#add-the-github-actions-workflow-to-your-repository).

## Add the GitHub Actions workflow to your repository

The sample GitHub Actions workflow includes:

- A `Create Neon Branch` action that creates a new Neon branch in your Neon project when you open or reopen a pull request in the connected GitHub repository.
- A `Delete Neon Branch` action that deletes the Neon branch from your Neon project when you close the pull request.
- Commented out code showing how to add database migration command to your workflow.

```yaml
name: Create/Delete Branch for Pull Request

on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - closed

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  setup:
    name: Setup
    outputs:
      branch: ${{ steps.branch_name.outputs.current_branch }}
    runs-on: ubuntu-latest
    steps:
      - name: Get branch name
        id: branch_name
        uses: tj-actions/branch-names@v8

  create_neon_branch:
    name: Create Neon Branch
    outputs:
      db_url: ${{ steps.create_neon_branch_encode.outputs.db_url }}
      db_url_with_pooler: ${{ steps.create_neon_branch_encode.outputs.db_url_with_pooler }}
    needs: setup
    if: |
      github.event_name == 'pull_request' && (
      github.event.action == 'synchronize'
      || github.event.action == 'opened'
      || github.event.action == 'reopened')
    runs-on: ubuntu-latest
    steps:
      - name: Create Neon Branch
        id: create_neon_branch
        uses: neondatabase/create-branch-action@v5
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch_name: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}

# The step above creates a new Neon branch.
# You may want to do something with the new branch, such as run migrations, run tests
# on it, or send the connection details to a hosting platform environment.
# The branch DATABASE_URL is available to you via:
# "${{ steps.create_neon_branch.outputs.db_url_with_pooler }}".
# It's important you don't log the DATABASE_URL as output as it contains a username and
# password for your database.
# For example, you can uncomment the lines below to run a database migration command:
#      - name: Run Migrations
#        run: npm run db:migrate
#        env:
#          DATABASE_URL: "${{ steps.create_neon_branch.outputs.db_url_with_pooler }}"

  delete_neon_branch:
    name: Delete Neon Branch
    needs: setup
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Delete Neon Branch
        uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}
```

To add the workflow to your repository:

1. In your repository, create a workflow file in the `.github/workflows` directory; for example, create a file named `neon_workflow.yml`.

   - If the `.github/workflows` directory already exists, add the file.
   - If your repository doesn't have a `.github/workflows` directory, add the file `.github/workflows/neon-workflow.yml`. This creates the `.github` and `workflows` directories and the `neon-workflow.yml` file.

   If you need more help with this step, see [Creating your first workflow](https://docs.github.com/en/actions/quickstart#creating-your-first-workflow), in the _GitHub documentation_, for an example.

   <Admonition type="note">
   For GitHub to discover any GitHub Actions workflows, you must save the workflow files in a directory called `.github/workflows` in your repository. Additionally, you can name the workflow file as you like, but you must use `.yml` or ``.yaml` as the file name extension.
   </Admonition>

2. Copy the workflow code into your `neon-workflow.yml` file.
3. Commit your changes.

### Using the GitHub Actions workflow

To see the workflow in action, create a pull request in your GitHub application repository. This will trigger the `Create Neon Branch` action. You can verify that the branch was created on the **Branches** page in the Neon Console. You should see a new branch with a `preview/pr-` name prefix.

Closing the pull request removes the Neon branch from the Neon project, which you can also verify on the **Branches** page in the Neon Console.

To see your workflow results in GitHub, follow the instructions in [Viewing your workflow results](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results), in the _GitHub documentation_.

## Building your own GitHub Actions workflow

The sample workflow provided by the GitHub integration serves as a basic template, which you can expand upon to develop your own workflows. That workflow uses Neon's create and delete branch GitHub Actions, which you can find here:

- [Create a Neon Branch](https://github.com/neondatabase/create-branch-action)
- [Delete a Neon Branch](https://github.com/neondatabase/delete-branch-action)

Neon also provides a [Reset a Neon Branch](https://github.com/neondatabase/reset-branch-action) action that resets a branch to the current state of the parent branch. This action is useful in a feature-driven workflow, where you need to reset your Neon development branch to the current state of your production branch before starting a new feature.

To add that action to a GitHub Action workflow, you might use code like this, depending on your workflow requirements.

```yaml
reset_neon_branch:
  name: Reset Neon Branch
  needs: setup
  if: |
    contains(github.event.pull_request.labels.*.name, 'Reset Neon Branch') &&
    github.event_name == 'pull_request' &&
    (github.event.action == 'synchronize' ||
     github.event.action == 'opened' ||
     github.event.action == 'reopened' ||
     github.event.action == 'labeled')
  runs-on: ubuntu-latest
  steps:
    - name: Reset Neon Branch
      uses: neondatabase/reset-branch-action@v1
      with:
        project_id: ${{ vars.NEON_PROJECT_ID }}
        parent: true
        branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
        api_key: ${{ secrets.NEON_API_KEY }}
```

The possibilities are numerous. You can use Neon's GitHub Actions in your workflow, create your own actions, or combine Neon's actions with actions of different platforms or services.

The `NEON_API_KEY` set by the Neon GitHub app allows you to run any [Neon API](https://api-docs.neon.tech/reference/getting-started-with-neon-api) method or [Neon CLI](https://neon.tech/docs/reference/neon-cli) command, which lets you create, update, and delete various objects in Neon like projects, branches, databases, roles, computes, and so on.

For applications that use GitHub Actions workflows with Neon, see [Example applications](/docs/guides/branching-github-actions#example-applications).

## Connect more Neon projects with the GitHub App

If you've installed the GitHub app previously, it's available to use with any project in your Neon account.

To connect another Neon project to a GitHub repository:

1. In the Neon Console, navigate to the **Integrations** page in your Neon project.
2. Locate the **GitHub** integration and click **Add**.
   ![GitHub App card](/docs/guides/github_card.png)
3. Select a GitHub repository to connect to your Neon project, and click **Connect**.

   You are advanced to the **Actions** tab on the final page of the setup, which outlines the actions performed to connect your Neon project to the selected GitHub repository, which includes:

   - Generating a Neon API key for your Neon account.
   - Creating a `NEON_API_KEY` secret in your GitHub repository.
   - Adding a `NEON_PROJECT_ID` variable to your GitHub repository.

   You are also provided with GitHub Actions workflow that you can copy to your GitHub repository to set up a basic branching workflow. For instructions, see [GitHub Actions workflow](#github-actions-workflow).

## Secrets and variable set by the GitHub integration

After connecting your Neon project to a GitHub repository, the GitHub integration performs the following actions:

- Generates a Neon API key for your Neon account
- Creates a `NEON_API_KEY` secret in your GitHub repository
- Adds a `NEON_PROJECT_ID` variable to your GitHub repository

The sample GitHub Actions workflow provided by the Neon GitHub integration uses these variabels and secrets to perfom actions in Neon.

    <Admonition type="note">
    These items are removed if you diconnect a Neon project from the associated GitHub repository. The items are removed for all Neo projects is you remove the Neon GitHub integration from your Neon account. See [Remove the GitHub integration](#remove-the-github-integration).
    </Admonition>

### Neon API key

To view the Neon API key created by the integration:

1. In the [Neon Console](https://console.neon.tech), click your profile at the top right corner of the page.
2. Select **Account settings**.
3. Select **API keys**.

The API key created by the integration should be listed with a name similar to the following: **API key for GitHub (cool-darkness-12345678)**. You cannot view the key itself, only the name it was given, the time it was created, and when the key was last used.

### Neon project ID variable and Neon API key secret

To view the variable containing your Neon project ID:

1. Navigate to your GitHub account page.
2. From your GitHub profile menu, select **Your repositories**.
3. Select the repository that you chose when installing the Neon GitHub integration.
4. On the repository page, select the **Settings** tab.
5. Select **Secrets and variables** > **Actions** from the sidebar.

Your `NEON_API_KEY` secret is listed on the **Secrets** tab, and the `NEON_PROJECT_ID` variable is listed on the **Variables** tab.

## Disconnect a Neon projects from a GitHub repository

Disconnecting Neon project from a GitHub repository performs the following actions for the Neon project:

- Removes the Neon API key created for this integration from your Neon account.
- Removes the GitHub secret containing the Neon API key from the associated GitHub repository.
- Removes the GitHub variable containing your Neon project ID from the associated GitHub repository..

Any GitHub Actions workflows that you've added to the GitHub repository that are dependent on these secrets and variables will no longer work.

To disconnect your Neon project:

1. In the Neon Console, navigate to the **Integrations** page for your project.
2. Locate the GitHub integration and click **Manage** to open the **GitHub integration** drawer.
3. Click **Disconnect**.

## Remove the GitHub integration

Removing the GitHub performs the following actions for all Neon projects that you connected to a GitHub repositiory using the GitHub integration:

- Removes the Neon API keys created for your Neon-GitHub integrations from your Neon account.
- Removes GitHub secrets containing the Neon API keys from the associated GitHub repositories.
- Removes the GitHub variables containing your Neon project IDs from the associated GitHub repositories.

Any GitHub Actions workflows that you've added to GitHub repositories that are dependent on these secrets and variables will no longer work.

To remove the GitHub integration:

1. In the Neon Console, navigate your account Profile.
2. Select Account settings.
3. Click **Disconnect**.
4. Click **Remove integration** to confirm your choice.

## Resources

- [A database for every preview environment using Neon, GitHub Actions, and Vercel](https://neon.tech/blog/branching-with-preview-environments)
- [Database Branching Workflows](https://neon.tech/flow)
- [Database branching workflow guide for developers](https://neon.tech/blog/database-branching-workflows-a-guide-for-developers)
- [Creating GitHub Actions](https://docs.github.com/en/actions/creating-actions)
- [Quickstart for GitHub Actions](https://docs.github.com/en/actions/quickstart)

## Feedback and future improvements

If you've got feature requests or feedback about what you'd like to see from the Neon GitHub integration, let us know via the [Feedback](https://console.neon.tech/app/projects?modal=feedback) form in the Neon Console or our [feedback channel](https://discord.com/channels/1176467419317940276/1176788564890112042) on Discord.

<NeedHelp/>