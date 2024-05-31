console.log("content js")

// Extract urls from Google maps
let trigger_fetch = () => {
    try {
        var urls_list = []
        var linkCount = document.evaluate(
            "//div[contains(@class,'Nv2PK')]//a[not(contains(.,'sourceurl='))]",
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null,
        );

        var node = null
        for (let i = 0; i < linkCount.snapshotLength; i++) {
            node = linkCount.snapshotItem(i);
            urls_list.push(node.getAttribute('href'))
        }

        pushUrlsToOdoo(urls_list)

        return true

    } catch (e) {
        console.error(e.message)
    }
}

// Inject a button into the webpage
function injectButton() {
    var buttonFetch = document.createElement("button");
    buttonFetch.innerHTML = "Export to Odoo";
    buttonFetch.id = "fetchData";
    buttonFetch.addEventListener("click", trigger_fetch);
    document.getElementById('omnibox-container').appendChild(buttonFetch);
}

// Add event listener to the button
window.onload =  function() {
    injectButton();
}

// Fetch data from Scraper Extension Storage
async function get_user_values(){
  console.log('Getting User values from Storage')
  data = await chrome.storage.local.get(["scraper_form"]).then((result) => {
    return result
  });

  return data
}

// Export urls to Odoo - Contact
async function pushUrlsToOdoo(urlsList) {
    console.log('Push urls to Odoo - Triggered')
    user_data = await get_user_values()

    let search_query = document.getElementById("searchboxinput").value

    if(user_data['scraper_form']){
      const BASE_URL_WITH_PORT = user_data['scraper_form']['baseUrlWithPort']
      const DB_NAME = 'update_scraper'
      const API_KEY = user_data['scraper_form']['apiKey']
      const USER_NAME = user_data['scraper_form']['username']
    
      const urlsBody = JSON.stringify({ urls: urlsList, dbname: DB_NAME, username: USER_NAME, password: API_KEY, baseurl: BASE_URL_WITH_PORT, query: search_query });
    
      response = await fetch(`${BASE_URL_WITH_PORT}/webhook/pushtoodoo`, {
        method: "POST",
        body: urlsBody,
        headers: {
          "Content-type": "application/json",
        },
      })
      
      result = await response.json()
      
      if(!Array.isArray(result.result)){
        alert(result.result)
        return false
      }
      alert('Data sent to Odoo!')
    }
    else{
      alert('Please update Values in Extension to Proceed!')
    }
  }