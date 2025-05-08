import { Form, useActionData } from '@remix-run/react';
import { json, redirect } from '@shopify/remix-oxygen';

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export async function action({ request, context }) {
    const form = await request.formData();
    const email = form.get('email');
    const password = form.get('password');
    const firstName = form.get('firstName');
    const lastName = form.get('lastName');

    try {
        const { customerCreate } = await context.storefront.mutate(CUSTOMER_CREATE_MUTATION, {
            variables: {
                input: {
                    email,
                    password,
                    firstName,
                    lastName,
                },
            },
        });

        const error = customerCreate?.customerUserErrors?.[0];

        if (error || !customerCreate?.customer) {
            return json({ error }, { status: 400 });
        }

        return redirect('/account/login');
    } catch (err) {
        console.error('Customer create error:', err);
        return json({ error: { message: 'Unexpected error. Please try again.' } }, { status: 500 });
    }
}

export default function Register() {
    const data = useActionData();

    return (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <h1>Create an Account</h1>
            <Form method="post">
                <div>
                    <label htmlFor="firstName">First Name</label>
                    <input id="firstName" name="firstName" type="text" required />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input id="lastName" name="lastName" type="text" required />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required />
                </div>

                {data?.error?.message && (
                    <p style={{ color: 'red' }}>{data.error.message}</p>
                )}

                <button type="submit">Create Account</button>
            </Form>

            <p>
                Already have an account? <a href="/account/login">Login here</a>
            </p>
        </div>
    );
}
