'use client';

import { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { paymentsApi } from '@/lib/api'; 
import { useRouter } from 'next/navigation';

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY as string, {
  locale: 'pt-BR'
});

interface PaymentFormProps {
  orderId: number;
  totalAmount: number;
}

export default function PaymentForm({ orderId, totalAmount }: PaymentFormProps) {
  const router = useRouter();

  const initialization = {
    amount: totalAmount,
    preferenceId: undefined,
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
    },
  };

  const onSubmit = async (formData: any) => {
    return new Promise<void>((resolve, reject) => {
      const { token, payment_method_id, installments, issuer_id, payer } = formData;
      paymentsApi.createCardPayment({
        orderId: orderId,
        token: token,
        paymentMethodId: payment_method_id,
        installments: installments,
        issuerId: issuer_id,
        email: payer.email,
      })
      .then((response) => {
        console.log('Pagamento processado:', response);
        router.push('/order/success');
        resolve();
      })
      .catch((error) => {
        console.error('Erro ao processar pagamento:', error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    console.error('Erro no Brick do Mercado Pago:', error);
  };

  const onReady = async () => {
    console.log('Formulário do Mercado Pago pronto!');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Pagamento Seguro</h2>
      
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
}