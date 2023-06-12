import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import './CheckoutForm.css'
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../../../Components/AuthProvider/AuthProvider";
import { useEffect } from "react";
import axios from "axios";



const CheckoutForm = ({price}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError,setCardError] = useState('')
  const {user} = useContext(AuthContext)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    if(price){
        axios.post('http://localHost:5000/create-payment-intent', {price: price})
        .then(res=>{
            console.log(res.data.clientSecret);
            setClientSecret(res.data.clientSecret)
        })
    }
  },[price])
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      console.log('[error]', error);
      setCardError(error.message)
    } else {
      console.log('[PaymentMethod]', paymentMethod);
    }

  const {paymentIntent,error: confirmError} = await stripe.confirmCardPayment( clientSecret,{
        payment_method: {
            card:card,
            billing_details: {
                name: user?.displayName || 'unknown',
                email: user?.email || 'unknown',
            },
        },
    },
  )

  };

  return (
  <>
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
    {cardError && <p className="text-red-600">{cardError}</p>}
  </>
  );
};

export default CheckoutForm