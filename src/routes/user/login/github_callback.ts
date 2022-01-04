import { RequestHandler } from '@sveltejs/kit';
import { config, handleLoginCode } from '$lib/auth/oauth';

export const get: RequestHandler = ({ url }) =>
  handleLoginCode(url, config.github, url.searchParams.get('code'));
