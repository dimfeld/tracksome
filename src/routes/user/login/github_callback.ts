import { RequestHandler } from '@sveltejs/kit';
import { config, handleLoginCode } from '$lib/auth/oauth';

export const get: RequestHandler = ({ url }) =>
  handleLoginCode(config.github, url.searchParams.get('code'));
