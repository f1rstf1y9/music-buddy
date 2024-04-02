import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: #8a77ff;
  text-decoration: underline;
  padding: 0;
  font-size: 100%;
  margin-left: 5px;
  cursor: pointer;
`;

export default function PasswordResetButton({ email }: { email: string }) {
  const onClick = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
      })
      .catch(() => {
        if (email === "") {
          alert("Please enter the email address!");
        } else {
          alert("Invalid Email");
        }
      });
  };

  return (
    <Wrapper>
      Did you forget your password?
      <Button onClick={onClick}> Send email &rarr;</Button>
    </Wrapper>
  );
}
