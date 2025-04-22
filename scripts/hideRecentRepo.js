import { Octokit } from '@octokit/rest';
import 'dotenv/config';

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

const query = `user:${process.env.GH_USER} is:public -repo:${process.env.GH_USER}/${process.env.EXCLUDED_REPO}`; // expects only one repo to exclude

export default async function hideLastUpdatedRepo() {
  console.log('--PROCESS START--');
  try {
    const {
      data: { items },
    } = await octokit.rest.search.repos({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: 1,
      page: 1,
    });

    console.log('[API SUCCESS] searched repos');

    if (!items || items?.length === 0)
      throw new Error('[API ERROR] No repositories found.');
    const { name } = items[0];
    if (name === process.env.EXCLUDED_REPO) {
      throw new Error(
        '[PARSING ERROR] Trying to change visibility of excluded repository.',
      );
    }

    console.log(`[PARSING SUCCESS] ${name}`);

    const {
      data: { name: respName, visibility },
    } = await octokit.rest.repos.update({
      owner: process.env.GH_USER,
      repo: name,
      visibility: 'private',
    });

    console.log(`[API SUCCESS] updated ${respName} to ${visibility}`);
    console.log('--PROCESS COMPLETED--');
  } catch (error) {
    console.log(error);
    console.log('--PROCESS ABORTED--');
  }
}

hideLastUpdatedRepo();
