import styled from "styled-components";

const Wrapper = styled.div`
  width: 350px;
  padding: 20px 50px 0 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  & > div {
    background-color: #ffffff13;
    border-radius: 10px;
    width: 100%;
    height: 500px;
  }
`;

export default function SideBar() {
  return (
    <Wrapper>
      <div></div>
      <div></div>
      <div></div>
    </Wrapper>
  );
}
