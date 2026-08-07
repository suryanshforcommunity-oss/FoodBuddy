async function insertWardens() {
  const url = "https://uutpiiplsxmmablhbrfp.supabase.co/rest/v1/users";
  const key = "sb_publishable_YX7had-hTbanQGZJtDRsmQ_M499fRiB";
  
  const wardens = [
    {
      name: "Chief Warden",
      email: "warden@college.edu",
      role: "authority",
      uid: "34f3fcb9-194b-4bed-8b99-2730571fc9cc"
    },
    {
      name: "Chief Warden 2",
      email: "warden2@college.edu",
      role: "authority",
      uid: "da0a5f7e-4f4d-4101-bc98-c5b4f4e863b8"
    }
  ];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(wardens)
    });
    
    if (!res.ok) {
      console.log("Error inserting:", res.status);
      console.log(await res.text());
    } else {
      console.log("Successfully inserted wardens into public.users table!");
    }
  } catch (err) {
    console.error(err);
  }
}
insertWardens();
