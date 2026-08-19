// Authentication Service for Abuja Taxi Platform
// Note: In a production app, use Supabase Auth or a real DB with hashed passwords.
import { INITIAL_DRIVERS } from '../data/mockStore.js';

let users = [
  { id: 'usr_1', email: 'passenger@example.com', password: 'password123', role: 'PASSENGER', name: 'Abuja Passenger' },
  ...INITIAL_DRIVERS.map(d => ({
    id: d.id,
    email: `${d.name.toLowerCase().replace(' ', '.')}@taxi.com`,
    password: 'password123',
    role: 'DRIVER',
    name: d.name
  }))
];

export function registerUser({ email, password, name, role }) {
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    password, // Stored as plain text for this MVP/Mock
    name,
    role: role || 'PASSENGER'
  };

  users.push(newUser);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export function loginUser(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function getUsers() {
  return users;
}
