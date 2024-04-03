import styled from "styled-components";
import PostForm from "../components/post-form";
import TimeLine from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  overflow-y: hidden;
  grid-template-rows: 1fr 6fr;
`;

export default function Home() {
  return (
    <Wrapper>
      <PostForm />
      <TimeLine />
    </Wrapper>
  );
}
