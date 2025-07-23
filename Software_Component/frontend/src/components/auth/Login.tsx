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

import axios from 'axios';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      })

      const { token, user } = loginResponse.data
      console.log('Login successful:', token)

      localStorage.setItem('userToken', token)

      const loggedInUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }

      onLogin(loggedInUser)
      toaster.positive('Login successful', { autoHideDuration: 4000 });
    }
    catch (error: any) {
      toaster.negative('Login credentials are wrong', { autoHideDuration: 3000 });
    }
  }

  return (
    <Block
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      overrides={{
        Block: {
          style: {
            background: "linear-gradient(to bottom left, #6b7280,  #262729ff, #000000, #262729ff, #6b7280)",
          },
        },
      }}
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
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.currentTarget.value })}
              placeholder="Enter your email"
              type="email"
              required
            />
          </FormControl>

          <FormControl label="Password">
            <Input
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.currentTarget.value })}
              placeholder="Enter your password"
              type="password"
              required
            />
          </FormControl>

          <Block marginTop="2rem">
            <Button
              type="submit"
              overrides={{
                BaseButton: {
                  style: {
                    width: '100%',
                    backgroundColor: '#398de0ff', // your custom blue
                    color: 'white',
                    ':hover': {
                      backgroundColor: '#1159a0ff', // darker blue on hover
                    },
                  },
                },
              }}
            >
              Log In 🔓
            </Button>
          </Block>
        </form>
      </Card>
    </Block>
  )
}

export default Login