<script lang="ts">
  import { invalidate } from '$app/navigation';

  function oauthLogin(provider: string) {
    const loginWindow = window.open(
      `/api/user/login/${provider}`,
      'oauthLogin',
      'width=600,height=400'
    );

    if (loginWindow) {
      window.addEventListener('message', function handler(event) {
        loginWindow.close();
        window.removeEventListener('message', handler);
        invalidate('/user');
      });
    }
  }
</script>

<button
  class="border-gray-500 bg-black text-white font-bold px-3 py-2 w-48"
  on:click={() => oauthLogin('github')}>Login with Github</button
>
