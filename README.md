# Unmaintained project

# GenericScoreboardAPI
Simple way to create a scoreboard without signups  
Example: https://github.com/NDevTK/CaptchaGame  
POST Request https://localhost/api JSON  
token: boardID+privateKey  
username: bob  
increment: 1  

# Example Javascript
```
async function increment(token, username = "Unnamed Player", number = 1) {
    let r = await fetch('https://localhost/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            username: username,
            increment: number
        })
    });
    return r.json();
}
```
