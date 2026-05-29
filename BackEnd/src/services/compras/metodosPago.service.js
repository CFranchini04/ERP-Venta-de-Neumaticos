import supabase from '../../config/supabase.js'

const getAllMetodosPago = async () => {
    try {
        console.log("Consultando metodos_de_pago...")
        const response = await supabase
            .from('metodos_de_pago')
            .select('*')
        console.log("Respuesta completa:", JSON.stringify(response, null, 2))
        const { data, error, status, statusText } = response
        console.log("Data:", data, "Error:", error, "Status:", status, statusText)
        if (error) throw new Error(error.message)
        return data
    } catch (err) {
        console.error("Error en getAllMetodosPago:", err)
        throw err
    }
}

export default { getAllMetodosPago }
