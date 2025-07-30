import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from "../src/pages/Login"
import App from './App';

test('submits form with email and password', async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn();

  render(<Login onLogin={mockLogin} />);
  render(<App />);

  await user.type(screen.getByPlaceholderText(/email/i), 'email');
  await user.type(screen.getByPlaceholderText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(mockLogin).toHaveBeenCalledWith({
    email ,
    password
  });
});