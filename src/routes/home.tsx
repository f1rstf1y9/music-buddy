import styled from "styled-components";
import PostForm from "../components/post-form";
import TimeLine from "../components/timeline";

const Menu = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-bottom: 0;
  font-weight: 600;
  & > div {
    width: calc(100% / 3);
    display: flex;
    justify-content: center;
    cursor: pointer;

    &.selected > span {
      padding: 10px;
      border-bottom: 3px solid #8a77ff;
    }
  }
`;

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  overflow-y: hidden;
`;

export default function Home() {
  return (
    <Wrapper>
      <Menu>
        <div className="selected">
          <span>모든 게시글</span>
        </div>
        <div>
          <span>팔로잉</span>
        </div>
        <div>
          <span>#청량한</span>
        </div>
      </Menu>
      <PostForm />
      <TimeLine />
    </Wrapper>
  );
}
