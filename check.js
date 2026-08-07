async function check() {
  const url = "https://uutpiiplsxmmablhbrfp.supabase.co/rest/v1/users?select=*";
  const key = "sb_publishable_YX7had-hTbanQGZJtDRsmQ_M499fRiB";
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    if (!res.ok) {
      console.log("Error status:", res.status);
      console.log(await res.text());
      return;
    }
    const data = await res.json();
    console.log("Users in table:", data.length);
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
check();
