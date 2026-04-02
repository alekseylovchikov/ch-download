function getToken(email, password) {
  return new Promise((resolve, reject) => {
    fetch("https://coursehunter.net/api/auth/login", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        accept: "application/json",
      },
      body: JSON.stringify({ e_mail: email, password }),
    })
      .then(async (res) => {
        const setCookies =
          typeof res.headers.getSetCookie === "function"
            ? res.headers.getSetCookie()
            : null;

        const firstCookie =
          (setCookies && setCookies[0]) || res.headers.get("set-cookie");

        const text = await res.text().catch(() => "");

        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (_) {
          data = null;
        }

        let token = data?.token ?? data?.accessToken;

        if (!token && typeof text === "string") {
          const m =
            text.match(/["']token["']\s*:\s*["']([^"']+)["']/) ||
            text.match(/accessToken\s*=\s*([^;\s"'<>]+)/);
          token = m?.[1];
        }

        if (!firstCookie) {
          console.error(
            "getToken: set-cookie missing. status=",
            res.status,
            "body=",
            text.slice(0, 400)
          );
          reject(new Error("Set-Cookie header not found in response"));
          return;
        }

        const hasAccessToken = firstCookie.includes("accessToken=");
        if (hasAccessToken) {
          resolve(firstCookie);
          return;
        }

        if (!token) {
          console.error(
            "getToken: token not found. status=",
            res.status,
            "body=",
            text.slice(0, 400)
          );
          reject(new Error("Access token not found in response"));
          return;
        }

        resolve(firstCookie + "; accessToken=" + token);
      })
      .catch((err) => {
        console.error("getToken: request failed", err);
        reject(err);
      });
  });
}

module.exports = getToken;
