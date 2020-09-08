import React, { useState, useContext } from "react";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

function Register(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { onChange, onSubmit, values } = useForm(registerUser, {
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, result) {
      context.login(result.data.register);
      props.history.push("/");
    },
    onError(err) {
      console.log(err.graphQLErrors[0].extensions.exception.errors);
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  function registerUser() {
    addUser();
  }

  return (
    <Grid textAlign="center" style={{ height: "100vh", paddingTop: "10rem" }}>
      <Grid.Column style={{ maxWidth: 600 }}>
        <Header as="h1" textAlign="center">
          Register an account
        </Header>
        <Form
          size="large"
          color="black"
          onSubmit={onSubmit}
          className={loading ? "loading" : ""}
        >
          <Segment stacked>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              name="username"
              value={values.username}
              onChange={onChange}
              error={errors.username ? true : false}
            />
            <Form.Input
              fluid
              icon="mail"
              iconPosition="left"
              placeholder="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={onChange}
              error={errors.email ? true : false}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={onChange}
              error={errors.password ? true : false}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={onChange}
              error={errors.confirmPassword ? true : false}
            />
            <Button type="submit" color="blue" fluid size="large">
              Register
            </Button>
          </Segment>
        </Form>
        {Object.keys(errors).length > 0 && (
          <div>
            <ul className="ui error message">
              {Object.values(errors).map(value => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
        )}
      </Grid.Column>
    </Grid>
  );
}

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Register;
