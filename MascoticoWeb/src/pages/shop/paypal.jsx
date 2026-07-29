import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Importa el hook para obtener parámetros de la URL

export default function LoginWithPayPal() {
  const [searchParams] = useSearchParams();
  const cartTotal = searchParams.get("total"); // Obtén el total desde los parámetros de la URL

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&components=buttons`;
    script.async = true;
    script.onload = () => {
      window.paypal.Buttons({
        style: {
          color: "blue",
          shape: "pill",
          label: "pay",
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "Carrito de compra",
                amount: {
                  currency_code: "USD",
                  value: cartTotal, // Usa el total recibido
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log(
              "Transacción completada por:",
              details.payer.name.given_name
            );
          });
        },
        onError: (err) => {
          console.error("Error al procesar el pago:", err);
        },
      }).render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, [cartTotal]); // Asegúrate de que useEffect se ejecute cuando cartTotal cambie

  return (
    <div className="flex items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url('https://i.pinimg.com/736x/97/39/f9/9739f90e2499adececbfb9dca69ce204.jpg')` }}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 sm:w-[32rem]">
        <h1 className="text-2xl font-bold text-center mb-4">Finalizar Compra</h1>
        <div id="paypal-button-container"></div>
      </div>
    </div>
  );
}
