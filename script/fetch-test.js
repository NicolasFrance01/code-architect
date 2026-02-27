async function check() {
    console.log("Fetching API...");
    const res = await fetch("https://code-architect-psi.vercel.app/api/projects");
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Body:", text.substring(0, 500));
}
check();
