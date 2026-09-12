const BASE_URL = import.meta.env.VITE_BACKEND_URL

export default async function loginWithGoogleApi(credentialResponse){
    const {credential} = credentialResponse
    const response = await fetch(`${BASE_URL}/auth/google`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({credential})
    })

    const data = await response.json()
    if(data.error){
        return data.error
    }
    if(data.message = 'User Logged In.'){
        return 'Successful'
    }
    else{
        return 'Failure'
    }
}