console.log("Welcome to GMap Extension!");

const DB_NAME = 'update_scraper'

// Handle form submission and save data to storage
function handleSubmit(event) {
  event.preventDefault(); // Prevent the form from submitting normally

  // Get form values
  var username = document.getElementById('username').value;
  var apiKey = document.getElementById('api_key').value;
  var baseUrlWithPort = document.getElementById('base_url_with_port').value;

  // Create an object to store form data
  var formData = {
    username: username,
    apiKey: apiKey,
    baseUrlWithPort: baseUrlWithPort
  };

  // Save form data to Chrome storage
  chrome.storage.local.set({ 'scraper_form': formData }).then(() => {
    console.log("Form data saved:", formData);
  }).catch((e) => console.log(e))

}

// Fetch data from Scraper Extension Storage
async function get_user_values(){
  console.log('Getting User values from Storage')
  data = await chrome.storage.local.get(["scraper_form"]).then((result) => {
    return result
  });

  return data
}

// Get queries from Odoo
async function get_queries_from_odoo() {
  console.log('Get queires from Odoo - Triggered')
  user_data = await get_user_values()

  if (user_data['scraper_form']) {
    try{
      const BASE_URL_WITH_PORT = user_data['scraper_form']['baseUrlWithPort']
      const API_KEY = user_data['scraper_form']['apiKey']
      const USER_NAME = user_data['scraper_form']['username']

      const urlsData = `dbname=${encodeURIComponent(DB_NAME)}&username=${encodeURIComponent(USER_NAME)}&password=${encodeURIComponent(API_KEY)}&baseurl=${encodeURIComponent(BASE_URL_WITH_PORT)}`
    
      response = await fetch(`${BASE_URL_WITH_PORT}/webhook/getmapqueries?${urlsData}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      })
      
      result = await response.text()
  
      document.getElementById("query-section").innerHTML = await result
      processBtns = document.getElementsByClassName("process-btn")

      for(let processBtn of processBtns){
        processBtn.addEventListener('click',async()=>{
          await process_query(processBtn.id)

          processBtn.innerText = "Processed"
        })
      }

      alert('Received queries successfully!')
      return result
    }
    catch(e){
      console.log(e)
    }
    
  }
  else {
    alert('Please update Values in Extension to Proceed!')
  }
}

// Process query confirmation ['POST'] request
async function process_query(query_id){
  console.log('Processing Query: ',query_id)
  user_data = await get_user_values()
  
  if (user_data['scraper_form']) {
    try{
      const BASE_URL_WITH_PORT = user_data['scraper_form']['baseUrlWithPort']
      const API_KEY = user_data['scraper_form']['apiKey']
      const USER_NAME = user_data['scraper_form']['username']

      const queryBody = JSON.stringify({ dbname: DB_NAME, username: USER_NAME, password: API_KEY, baseurl: BASE_URL_WITH_PORT, query_id: query_id });
    
      response = await fetch(`${BASE_URL_WITH_PORT}/webhook/archieveQuery`, {
        method: "POST",
        body: queryBody,
        headers: {
          "Content-type": "application/json",
        },
      })

      result = await response.json()
      return result

    }
    catch(e){
      console.log(e)
    }
  }
  else {
    alert('Please update Values in Extension to Proceed!')
  }
}

// Add event listener to the form for submission
document.addEventListener('DOMContentLoaded', async function () {
  
  document.getElementById('scraper_form_submitButton').addEventListener('click', handleSubmit);

  input_values = await chrome.storage.local.get(["scraper_form"]).then((result) => {
    return (result)
  })

  if (input_values['scraper_form']) {
    document.getElementById('username').value = input_values['scraper_form']['username'];
    document.getElementById('api_key').value = input_values['scraper_form']['apiKey'];
    document.getElementById('base_url_with_port').value = input_values['scraper_form']['baseUrlWithPort'];
  }

  document.getElementById('get_queries_button').addEventListener('click', get_queries_from_odoo);
});