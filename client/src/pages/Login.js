import React, { useState, useContext } from "react";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { useForm } from "../util/hooks";
import { AuthContext } from "../context/auth";

function Login(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { onChange, onSubmit, values } = useForm(loginUserCallback, {
    username: "",
    password: ""
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, result) {
      console.log(result.data.login);
      context.login(result.data.login);
      props.history.push("/");
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  function loginUserCallback() {
    loginUser();
  }

  return (
    <Grid textAlign="center" style={{ height: "100vh", paddingTop: "10rem" }}>
      <Grid.Column style={{ maxWidth: 600 }}>
        <Header as="h1" textAlign="center">
          Login To Your Account
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
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={onChange}
              error={errors.password ? true : false}
            />
            <Button type="submit" color="blue" fluid size="large">
              Login
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

const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Login;
