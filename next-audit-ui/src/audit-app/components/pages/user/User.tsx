import React from "react";
import { Field, Form } from "react-final-form";
import TextInput from "../../common/textInput/TextInput";
import content from "./content.svg";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../state/store";
import { useNavigate } from "react-router-dom";
import { updateShowSpinner } from "../../../state/pageSlice";
import { signInAsync } from "../../../state/userSlice";

const User = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const submitForm = (formState: any) => {
    console.log(formState);

    const form: any = document.getElementById("signin-form");

    if (!form.checkValidity()) {
      window.confirm('Ensure all fields are populated');
      return;
    }

    dispatch(updateShowSpinner(true));
    dispatch(signInAsync(formState))
    .unwrap()
    .then(() => { 
      dispatch(updateShowSpinner(false));
      navigate("/");
    })
    .catch(err => { 
      dispatch(updateShowSpinner(false));
      setTimeout(() =>  window.confirm('Email/Password is invalid'), 50);
    })

  };

  // TO DO : On Submit
  return (
    <div className="flex items-center">
       <Form
        onSubmit={submitForm}
        render={({ handleSubmit, form: { getState }}) => (
          <form onSubmit={handleSubmit} id="signin-form" 
          className="rounded p-8 w-2/6 m-auto">

            <div>
              <img className="m-auto" src={content}/>
            </div>

            <div className="text-center">
              <h2 className="text-5xl mb-5">Log in to your account</h2>
              <h3 className="text-2xl mb-3">Welcome back! Please Enter your details</h3>
            </div>
            
            <Field name="email">
              {props => (
                <div>
                  <TextInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Email"
                    placeholder="Enter your email"
                    onChange={props.input.onChange}
                    required={true}
                  />
                </div>
              )}
            </Field>

            <Field name="password">
              {props => (
                <div>
                  <TextInput
                    name={props.input.name}
                    value={props.input.value}
                    label="Password"
                    onChange={props.input.onChange}
                    required={true}
                  />
                </div>
              )}
            </Field>
            <button className="bg-logoPurple rounded-lg h-12 text-white w-full block p-2" 
             onClick={() => submitForm(getState().values)} type="button">
              <span className="text-xl">Sign in</span>
            </button>
          </form>
        )}
      />
    </div>
  );
}

export default User;