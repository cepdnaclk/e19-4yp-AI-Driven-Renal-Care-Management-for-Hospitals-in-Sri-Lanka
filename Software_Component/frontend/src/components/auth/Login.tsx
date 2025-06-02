import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from 'baseui/card';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { Select } from 'baseui/select';
import { toaster } from 'baseui/toast';
import { HeadingXLarge, ParagraphLarge, ParagraphMedium } from 'baseui/typography';
import { Block } from 'baseui/block';

import { User, Role } from '../../types/index';
import data from "../../data.json"

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<{ label: string; id: Role }[]>([])
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || role.length === 0) {
      toaster.negative('Please fill in all fields', {})
      return
    }

    const user: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role: role[0].id,
    }

    onLogin(user);

    // Redirect based on role
    if (role[0].id === Role.NURSE) {
      navigate('/nurse/dashboard');
    } else if (role[0].id === Role.DOCTOR) {
      navigate('/doctor/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Block
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      backgroundColor="#f6f6f6"
    >
      <Card
        overrides={{
          Root: {
            style: {
              width: '530px',
              maxWidth: '90%',
              padding: '1.5rem',
            },
          },
        }}
      >
        <Block marginBottom="1rem" display="flex" flexDirection="column" alignItems="center">
          <HeadingXLarge marginTop="0" marginBottom="0.5rem"> {data.title} </HeadingXLarge>
          <ParagraphLarge marginTop="2"> {data.subtitle} </ParagraphLarge>
        </Block>

        <form onSubmit={handleSubmit}>
          <FormControl label="Email">
            <Input
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              placeholder="Enter your email"
              type="email"
              required
            />
          </FormControl>

          <FormControl label="Password">
            <Input
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              placeholder="Enter your password"
              type="password"
              required
            />
          </FormControl>

          <FormControl label="Role">
            <Select
              options={[
                { label: 'Nurse', id: Role.NURSE },
                { label: 'Doctor', id: Role.DOCTOR },
                { label: 'Admin', id: Role.ADMIN },
              ]}
              value={role}
              placeholder="Select your role"
              onChange={params =>
                setRole([...params.value] as { label: string; id: Role }[])
              }
              required
            />
          </FormControl>

          <Block marginTop="2rem">
            <Button type="submit" overrides={{ BaseButton: { style: { width: '100%' } } }}> Log In </Button>
          </Block>
        </form>
      </Card>
    </Block>
  )
}

export default Login