import styled from "styled-components";
import { IPost } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";

const Wrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 20px;
  padding: 20px;
  border: 1px solid #616161;
  border-radius: 10px;
  background: rgb(255, 255, 255, 0.1);
  background: linear-gradient(
    149deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.1) 29%,
    rgba(246, 244, 255, 0.1) 62%,
    rgba(138, 119, 255, 0.1) 100%
  );
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProfileImg = styled.div`
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
`;

const Photo = styled.img`
  margin-top: 10px;
  width: 100%;
  height: 350px;
  border-radius: 15px;
  object-fit: cover;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 16px;
  white-space: pre-wrap;
  line-height: 20px;
`;

const SettingButton = styled.div`
  & > div {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
    & > svg {
      width: 25px;
      height: 25px;
      & > path {
        transition: 0.3s;
      }
    }
    &:hover {
      background-color: #9d8eff34;
      & > svg > path {
        fill: #a496ff;
      }
    }
  }
`;

const ButtonGroup = styled.div`
  z-index: 1;
  position: absolute;
  right: 20px;
  top: 55px;
  padding: 20px 25px;
  border: 1px solid #616161;
  border-radius: 10px;
  background: #363636c5;
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 8px 0 rgba(19, 19, 19, 0.582);
`;

const Button = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  transition: 0.3s;
  & > svg {
    width: 15px;
    height: 15px;
  }
  &.delete-btn {
    color: tomato;
    & > svg path {
      fill: tomato;
    }
  }
  &:hover {
    filter: brightness(0.7);
  }
`;

export default function Post({ username, photo, post, userId, id }: IPost) {
  const user = auth.currentUser;

  const [showButtons, setShowButtons] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showButtons) {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setShowButtons(false);
        }
      };
      if (showButtons) {
        document.addEventListener("click", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [showButtons]);

  const toggleButtonsDisplay = () => {
    setShowButtons(!showButtons);
  };

  const onDelete = async () => {
    const ok = confirm("게시글을 삭제할까요?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      if (photo) {
        const photoRef = ref(
          storage,
          `posts/${user.uid}-${user.displayName}/${id}`
        );
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  return (
    <>
      <Wrapper>
        <Column>
          <ProfileImg></ProfileImg>
        </Column>
        <Column>
          <Row>
            <Username>{username}</Username>
            <SettingButton ref={buttonRef}>
              {user?.uid === userId ? (
                <div onClick={toggleButtonsDisplay}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 11C14.4477 11 14 10.5523 14 10C14 9.44772 14.4477 9 15 9C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11Z"
                      fill="#FFFFFF"
                    ></path>
                    <path
                      d="M10.0001 11C9.44778 11 9.00006 10.5523 9.00006 10C9.00006 9.44772 9.44778 9 10.0001 9C10.5523 9 11.0001 9.44772 11.0001 10C11.0001 10.5523 10.5523 11 10.0001 11Z"
                      fill="#FFFFFF"
                    ></path>
                    <path
                      d="M5 11C4.44772 11 4 10.5523 4 10C4 9.44772 4.44772 9 5 9C5.55228 9 6 9.44772 6 10C6 10.5523 5.55228 11 5 11Z"
                      fill="#FFFFFF"
                    ></path>
                  </svg>
                </div>
              ) : null}
            </SettingButton>
          </Row>
          <Row>
            <Payload>{post}</Payload>
          </Row>
          <Row>{photo ? <Photo src={photo} /> : null}</Row>
        </Column>
        {user?.uid === userId && showButtons ? (
          <ButtonGroup>
            <Button onClick={onDelete} className="delete-btn">
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.9814 8.95183C7.56974 8.95183 7.23625 9.28784 7.23625 9.70204V14.5704C7.23625 14.9846 7.56974 15.3206 7.9814 15.3206C8.39306 15.3206 8.72656 14.9846 8.72656 14.5704V9.70204C8.72656 9.28784 8.39306 8.95183 7.9814 8.95183Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M11.8492 8.95183C11.4375 8.95183 11.104 9.28784 11.104 9.70204V14.5704C11.104 14.9846 11.4375 15.3206 11.8492 15.3206C12.2608 15.3206 12.5943 14.9846 12.5943 14.5704V9.70204C12.5943 9.28784 12.2608 8.95183 11.8492 8.95183Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.511 3.18722C14.5353 3.42349 14.5449 3.69281 14.5486 3.99378C14.6333 4.00304 14.716 4.01323 14.7967 4.02444C15.7187 4.15257 16.4937 4.42758 17.0887 5.07168C17.6838 5.71577 17.9002 6.51395 17.9606 7.44913C18.0188 8.35066 17.9367 9.49329 17.8348 10.9118L17.5471 14.9158C17.458 16.1566 17.3858 17.161 17.2255 17.9494C17.0587 18.77 16.7784 19.4578 16.2031 19.9967C15.6278 20.5356 14.9263 20.7675 14.1014 20.8759C13.3088 20.98 12.3087 20.98 11.0733 20.98H9.07507C7.87246 20.98 6.89806 20.98 6.12376 20.8796C5.31738 20.775 4.63009 20.5514 4.05976 20.0323C3.48945 19.5133 3.19928 18.8473 3.0147 18.05C2.83745 17.2844 2.73928 16.3083 2.61811 15.1034L2.21541 11.0997C2.06924 9.64671 1.95162 8.4775 1.98601 7.55398C2.02164 6.5968 2.22247 5.77659 2.82031 5.11054C3.41817 4.44447 4.20839 4.1606 5.1506 4.02843C5.20847 4.02032 5.26739 4.01272 5.32737 4.0056C5.33098 3.69986 5.34042 3.42658 5.36506 3.18722C5.40726 2.77736 5.50038 2.38297 5.74317 2.02607C5.90997 1.78088 6.12045 1.56894 6.36395 1.40097C6.71842 1.15647 7.11014 1.06269 7.51722 1.02019C7.90272 0.979947 8.37779 0.979963 8.93426 0.979981H10.9428C11.4993 0.979963 11.9734 0.979947 12.3589 1.02019C12.7659 1.06269 13.1577 1.15647 13.5121 1.40097C13.7556 1.56894 13.9661 1.78088 14.1329 2.02607C14.3757 2.38297 14.4688 2.77736 14.511 3.18722ZM13.0287 3.34193C13.0449 3.4997 13.0529 3.68413 13.0568 3.9113C12.5417 3.90094 11.976 3.90095 11.3577 3.90096H8.67709C7.99624 3.90095 7.37781 3.90094 6.81919 3.91413C6.82311 3.68566 6.83112 3.50036 6.84743 3.34193C6.87715 3.0533 6.92787 2.93987 6.97274 2.87391C7.03549 2.78166 7.11468 2.70193 7.20628 2.63874C7.27174 2.59359 7.38433 2.54252 7.67093 2.5126C7.97041 2.48134 8.36657 2.4804 8.9711 2.4804H10.905C11.5095 2.4804 11.9057 2.48134 12.2051 2.5126C12.4917 2.54252 12.6043 2.59359 12.6698 2.63874C12.7614 2.70193 12.8406 2.78166 12.9033 2.87391C12.9482 2.93987 12.9989 3.0533 13.0287 3.34193ZM5.35625 5.51449C6.15042 5.40309 7.21329 5.40137 8.73467 5.40137H11.301C12.7834 5.40137 13.8179 5.40306 14.5929 5.51076C15.3465 5.61549 15.732 5.80619 15.9975 6.09355C16.263 6.38093 16.4241 6.78192 16.4734 7.54645C16.5242 8.33262 16.4512 9.37174 16.3443 10.8606L16.0645 14.7552C15.9707 16.0608 15.904 16.9671 15.7655 17.6485C15.6312 18.3087 15.4478 18.6548 15.1879 18.8982C14.9281 19.1416 14.5721 19.3009 13.9085 19.3881C13.2237 19.4781 12.3211 19.4796 11.0212 19.4796H9.12641C7.86032 19.4796 6.98218 19.4781 6.31418 19.3915C5.66728 19.3076 5.31727 19.1542 5.05916 18.9193C4.80103 18.6844 4.6142 18.3491 4.4661 17.7094C4.31318 17.0489 4.22325 16.1693 4.09567 14.9009L3.70394 11.0062C3.55063 9.48208 3.44523 8.41706 3.47527 7.61019C3.50451 6.82484 3.66004 6.41286 3.92602 6.11653C4.19199 5.82021 4.58331 5.62291 5.35625 5.51449Z"
                  fill="#FFFFFF"
                ></path>
              </svg>
              <span>삭제하기</span>
            </Button>
            <Button>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.157 2.54498C15.1692 2.55593 15.1815 2.56692 15.1938 2.57795L16.0902 3.38075C16.1025 3.39178 16.1148 3.40277 16.127 3.41372C16.6228 3.85774 17.0501 4.24031 17.3508 4.59246C17.6731 4.96987 17.9245 5.39523 17.953 5.93419C17.9815 6.47315 17.7764 6.92243 17.4957 7.33143C17.2338 7.71306 16.8493 8.13817 16.4031 8.63155L8.76197 17.0808C8.7375 17.1078 8.71334 17.1346 8.68947 17.161C8.26875 17.6271 7.93599 17.9956 7.49506 18.2258C7.05413 18.4559 6.56024 18.5187 5.93579 18.5982C5.90036 18.6027 5.8645 18.6073 5.82821 18.6119L4.07295 18.8368C3.57681 18.9004 3.12818 18.9579 2.76259 18.9534C2.36385 18.9485 1.92972 18.871 1.56533 18.5447C1.20094 18.2184 1.07792 17.7969 1.03113 17.4028C0.98822 17.0415 0.998592 16.5914 1.01007 16.0938L1.05046 14.3331C1.0513 14.2967 1.05209 14.2607 1.05288 14.2252C1.0667 13.5989 1.07764 13.1035 1.2613 12.643C1.44497 12.1824 1.77837 11.8144 2.1999 11.3491C2.22382 11.3227 2.24802 11.296 2.27249 11.2689L9.88048 2.85637C9.89156 2.84411 9.90261 2.8319 9.91362 2.81972C10.3598 2.32629 10.7442 1.90115 11.0981 1.6019C11.4774 1.28119 11.9048 1.03101 12.4464 1.00263C12.988 0.974255 13.4395 1.17838 13.8505 1.45768C14.234 1.71829 14.6612 2.10091 15.157 2.54498ZM13.0018 2.69441C12.7299 2.5096 12.6064 2.49391 12.5255 2.49815C12.4446 2.50239 12.3236 2.53089 12.0726 2.7431C11.805 2.96937 11.4879 3.31768 10.9991 3.85817L3.39111 12.2708C2.86247 12.8553 2.73154 13.0162 2.66008 13.1954C2.58862 13.3746 2.57302 13.5811 2.55498 14.3673L2.51571 16.079C2.5028 16.6416 2.49674 16.9836 2.52564 17.227C2.53901 17.3397 2.55662 17.3955 2.56699 17.4201C2.56933 17.4256 2.57114 17.4292 2.57227 17.4313C2.57444 17.4322 2.57821 17.4336 2.584 17.4353C2.6097 17.443 2.66731 17.4546 2.78127 17.456C3.02753 17.459 3.36874 17.4171 3.92961 17.3452L5.63605 17.1266C6.41984 17.0262 6.62454 16.989 6.79609 16.8995C6.96765 16.81 7.11472 16.6635 7.64336 16.079L15.2513 7.66638C15.7401 7.12589 16.0549 6.77545 16.2529 6.48688C16.4386 6.21626 16.4544 6.09344 16.4502 6.01294C16.4459 5.93244 16.4173 5.81194 16.204 5.56222C15.9766 5.29594 15.6266 4.98034 15.0835 4.49392L14.1871 3.69112C13.6439 3.20471 13.2918 2.89147 13.0018 2.69441Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.4722 18.2512C10.4722 17.8377 10.8091 17.5024 11.2246 17.5024H18.2475C18.6631 17.5024 19 17.8377 19 18.2512C19 18.6648 18.6631 19 18.2475 19H11.2246C10.8091 19 10.4722 18.6648 10.4722 18.2512Z"
                  fill="#FFFFFF"
                ></path>
              </svg>
              <span>수정하기</span>
            </Button>
          </ButtonGroup>
        ) : null}
      </Wrapper>
    </>
  );
}
