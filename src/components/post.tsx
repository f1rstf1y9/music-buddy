import styled from "styled-components";
import loadingSpinner from "../../public/loading-spinner.gif";
import { IPost } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, updateDoc, doc } from "firebase/firestore";
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
  &.sub-buttons {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    gap: 30%;
    margin-top: 15px;
    & > div {
      font-size: 14px;
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: center;
      color: #cdcdcd;
      & > svg {
        width: 16px;
        height: 16px;
      }
    }
  }
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
  & > b {
    font-weight: 600;
    color: #8a77ff;
    cursor: pointer;
  }
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

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #4a408e39;
  z-index: 99;
`;

const EditForm = styled.form`
  display: grid;
  grid-template-rows: 50px 1fr 80px;
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  padding: 10px 20px 0 20px;
  min-height: 300px;
  border-radius: 15px;
  background-color: #181818;
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  color: white;
  border: none;
  background-color: transparent;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:last-child {
    border-top: 1px solid #333333;
  }
  & > .close-btn {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
`;

const AttachFileButton = styled.label<{ $isFileUploaded: boolean }>`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
  ${(props) =>
    props.$isFileUploaded ? "pointer-events: none; opacity: 0.5" : ""}
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input<{ $isLoading: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 100px;
  background-color: #5e50b4;
  background-image: url(${loadingSpinner});
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  color: white;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #8f81e3;
  font-size: 14px;
  font-weight: 600;
  &:hover,
  &:active {
    opacity: ${(props) => (props.$isLoading ? "1" : "0.9")};
  }
  ${(props) =>
    props.$isLoading
      ? "pointer-events: none; opacity: 0.7;"
      : "background-image: none; "}
`;

export default function Post({ username, photo, post, userId, id }: IPost) {
  const user = auth.currentUser;

  const [showButtons, setShowButtons] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatedPost, setUpdatedPost] = useState(post);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploaded, setFileUploaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const onEdit = async () => {
    if (user?.uid !== userId) return;
    setUpdatedPost(post);
    setShowEditModal(true);
  };

  const onClose = () => {
    setShowEditModal(false);
  };

  const onPostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedPost(e.target.value);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      if (files[0].size > 1024 * 1024) {
        alert("1MB 이하의 이미지만 업로드할 수 있습니다.");
        return;
      }
      setFile(files[0]);
      setFileUploaded(true);
    }
    e.target.value = "";
  };

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || isLoading || post === "" || post.length > 180) return;

    try {
      setIsLoading(true);
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, { post: updatedPost });
    } catch (error) {
      console.error("Error updating post: ", error);
    } finally {
      setIsLoading(false);
      setShowEditModal(false);
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
            <Payload
              dangerouslySetInnerHTML={{
                __html: post?.replace(/#(\S+)/g, "<b>#$1</b>"),
              }}
            />
          </Row>
          <Row>{photo ? <Photo src={photo} /> : null}</Row>{" "}
          <Row className="sub-buttons">
            <div>
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
                  d="M10 1C5.07504 1 1 4.9078 1 9.8312C1 11.8148 1.66696 13.6432 2.7855 15.1123C2.9659 15.3493 3.02377 15.5422 3.0146 15.6792C2.96869 16.3648 2.73933 17.0367 2.15953 17.6394C1.95948 17.8473 1.89268 18.1554 1.98506 18.4315C2.0776 18.7081 2.31536 18.908 2.5998 18.9397C4.42103 19.1428 6.02795 18.799 6.98589 18.4095C7.21448 18.3165 7.43307 18.2998 7.6091 18.3473C8.37142 18.5529 9.17331 18.6624 10 18.6624C14.925 18.6624 19 14.7546 19 9.8312C19 4.9078 14.925 1 10 1ZM2.46752 9.8312C2.46752 5.84346 5.7947 2.52801 10 2.52801C14.2053 2.52801 17.5325 5.84346 17.5325 9.8312C17.5325 13.8189 14.2053 17.1344 10 17.1344C9.29812 17.1344 8.61989 17.0415 7.97716 16.8681C7.44373 16.7243 6.90604 16.8015 6.45189 16.9862C5.91921 17.2028 5.07261 17.4197 4.06131 17.4639C4.31547 16.9133 4.44117 16.344 4.47857 15.7855C4.52324 15.1184 4.23423 14.5554 3.93552 14.1631C3.00996 12.9474 2.46752 11.4495 2.46752 9.8312Z"
                  fill="#cdcdcd"
                ></path>
              </svg>
              <span>0</span>
            </div>
            <div>
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
                  d="M9.79983 6.69443C9.40054 6.49179 8.94091 6.32836 8.45056 6.45049C8.12949 6.53045 7.83484 6.6963 7.5963 6.93101C7.23246 7.289 7.11756 7.77431 7.0671 8.22957C7.01713 8.68049 7.01715 9.26228 7.01717 9.9554V10.0442C7.01715 10.7373 7.01713 11.3191 7.0671 11.77C7.11756 12.2253 7.23246 12.7106 7.5963 13.0686C7.83484 13.3033 8.12949 13.4692 8.45056 13.5491C8.94091 13.6712 9.40054 13.5078 9.79983 13.3052C10.1952 13.1045 10.6703 12.7898 11.2358 12.4151L11.3071 12.3679C11.795 12.0447 12.211 11.7692 12.5148 11.5135C12.8283 11.2498 13.1261 10.9247 13.2371 10.4673C13.3116 10.1604 13.3116 9.83926 13.2371 9.5323C13.1261 9.07488 12.8283 8.74986 12.5148 8.48607C12.211 8.23043 11.7951 7.95492 11.3071 7.63172L11.2359 7.58451C10.6703 7.20981 10.1952 6.89507 9.79983 6.69443ZM8.56326 7.9684C8.624 7.90863 8.69878 7.86664 8.77994 7.84643C8.78083 7.8462 8.78587 7.84493 8.79712 7.84502C8.80926 7.84512 8.82935 7.84682 8.85987 7.8537C8.92127 7.86755 9.02205 7.90176 9.18066 7.98226C9.49561 8.14209 9.90335 8.41085 10.5148 8.81587C11.0467 9.16827 11.3943 9.39986 11.6291 9.59735C11.8592 9.79101 11.8784 9.87063 11.8806 9.8798C11.8997 9.95858 11.8997 10.0413 11.8806 10.12C11.8784 10.1292 11.8592 10.2086 11.6291 10.4023C11.3943 10.5997 11.0467 10.8313 10.5148 11.1837C9.90335 11.5888 9.49561 11.8575 9.18066 12.0174C9.02205 12.0978 8.92127 12.1321 8.85987 12.1459C8.82935 12.1528 8.80926 12.1545 8.79712 12.1546C8.78555 12.1547 8.78062 12.1534 8.77994 12.1532C8.69878 12.133 8.62395 12.0909 8.56321 12.0312C8.56243 12.0304 8.5585 12.0265 8.55226 12.0164C8.54558 12.0054 8.53595 11.9868 8.52497 11.9563C8.50287 11.8951 8.47623 11.7888 8.45615 11.6075C8.41628 11.2478 8.41518 10.7487 8.41518 9.9998C8.41518 9.25094 8.41628 8.75185 8.45615 8.39209C8.47623 8.21083 8.50287 8.10454 8.52497 8.04328C8.53595 8.01281 8.54558 7.99416 8.55226 7.98326C8.5585 7.97307 8.56247 7.96917 8.56326 7.9684Z"
                  fill="#cdcdcd"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM2.51285 10C2.51285 5.86496 5.86496 2.51285 10 2.51285C14.135 2.51285 17.4872 5.86496 17.4872 10C17.4872 14.135 14.135 17.4872 10 17.4872C5.86496 17.4872 2.51285 14.135 2.51285 10Z"
                  fill="#cdcdcd"
                ></path>
              </svg>
              <span>0</span>
            </div>
            <div>
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
                  d="M19 3.65757C19 1.95154 17.4536 0.684366 15.8293 1.06933L7.58568 3.02307C6.41033 3.30163 5.57976 4.3757 5.57976 5.61131V13.171C5.12941 12.9012 4.60541 12.7466 4.04631 12.7466C2.36214 12.7466 1 14.1482 1 15.8733C1 17.5984 2.36214 19 4.04631 19C5.73047 19 7.09261 17.5984 7.09261 15.8733V9.43428L17.4872 6.97075V11.2897C17.0368 11.0199 16.5128 10.8652 15.9537 10.8652C14.2695 10.8652 12.9074 12.2668 12.9074 13.9919C12.9074 15.717 14.2695 17.1186 15.9537 17.1186C17.6379 17.1186 19 15.717 19 13.9919V3.65757ZM16.1702 2.5794C16.8417 2.42026 17.4872 2.94382 17.4872 3.65757V5.37986L7.09261 7.84339V5.61131C7.09261 5.09477 7.43963 4.64858 7.92666 4.53315L16.1702 2.5794ZM14.4202 13.9919C14.4202 13.1193 15.1085 12.4152 15.9537 12.4152C16.7989 12.4152 17.4872 13.1193 17.4872 13.9919C17.4872 14.8645 16.7989 15.5687 15.9537 15.5687C15.1085 15.5687 14.4202 14.8645 14.4202 13.9919ZM2.51285 15.8733C2.51285 15.0007 3.20113 14.2965 4.04631 14.2965C4.89148 14.2965 5.57976 15.0007 5.57976 15.8733C5.57976 16.7459 4.89148 17.45 4.04631 17.45C3.20113 17.45 2.51285 16.7459 2.51285 15.8733Z"
                  fill="#cdcdcd"
                ></path>
              </svg>
              <span>0</span>
            </div>
          </Row>
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
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.511 3.18722C14.5353 3.42349 14.5449 3.69281 14.5486 3.99378C14.6333 4.00304 14.716 4.01323 14.7967 4.02444C15.7187 4.15257 16.4937 4.42758 17.0887 5.07168C17.6838 5.71577 17.9002 6.51395 17.9606 7.44913C18.0188 8.35066 17.9367 9.49329 17.8348 10.9118L17.5471 14.9158C17.458 16.1566 17.3858 17.161 17.2255 17.9494C17.0587 18.77 16.7784 19.4578 16.2031 19.9967C15.6278 20.5356 14.9263 20.7675 14.1014 20.8759C13.3088 20.98 12.3087 20.98 11.0733 20.98H9.07507C7.87246 20.98 6.89806 20.98 6.12376 20.8796C5.31738 20.775 4.63009 20.5514 4.05976 20.0323C3.48945 19.5133 3.19928 18.8473 3.0147 18.05C2.83745 17.2844 2.73928 16.3083 2.61811 15.1034L2.21541 11.0997C2.06924 9.64671 1.95162 8.4775 1.98601 7.55398C2.02164 6.5968 2.22247 5.77659 2.82031 5.11054C3.41817 4.44447 4.20839 4.1606 5.1506 4.02843C5.20847 4.02032 5.26739 4.01272 5.32737 4.0056C5.33098 3.69986 5.34042 3.42658 5.36506 3.18722C5.40726 2.77736 5.50038 2.38297 5.74317 2.02607C5.90997 1.78088 6.12045 1.56894 6.36395 1.40097C6.71842 1.15647 7.11014 1.06269 7.51722 1.02019C7.90272 0.979947 8.37779 0.979963 8.93426 0.979981H10.9428C11.4993 0.979963 11.9734 0.979947 12.3589 1.02019C12.7659 1.06269 13.1577 1.15647 13.5121 1.40097C13.7556 1.56894 13.9661 1.78088 14.1329 2.02607C14.3757 2.38297 14.4688 2.77736 14.511 3.18722ZM13.0287 3.34193C13.0449 3.4997 13.0529 3.68413 13.0568 3.9113C12.5417 3.90094 11.976 3.90095 11.3577 3.90096H8.67709C7.99624 3.90095 7.37781 3.90094 6.81919 3.91413C6.82311 3.68566 6.83112 3.50036 6.84743 3.34193C6.87715 3.0533 6.92787 2.93987 6.97274 2.87391C7.03549 2.78166 7.11468 2.70193 7.20628 2.63874C7.27174 2.59359 7.38433 2.54252 7.67093 2.5126C7.97041 2.48134 8.36657 2.4804 8.9711 2.4804H10.905C11.5095 2.4804 11.9057 2.48134 12.2051 2.5126C12.4917 2.54252 12.6043 2.59359 12.6698 2.63874C12.7614 2.70193 12.8406 2.78166 12.9033 2.87391C12.9482 2.93987 12.9989 3.0533 13.0287 3.34193ZM5.35625 5.51449C6.15042 5.40309 7.21329 5.40137 8.73467 5.40137H11.301C12.7834 5.40137 13.8179 5.40306 14.5929 5.51076C15.3465 5.61549 15.732 5.80619 15.9975 6.09355C16.263 6.38093 16.4241 6.78192 16.4734 7.54645C16.5242 8.33262 16.4512 9.37174 16.3443 10.8606L16.0645 14.7552C15.9707 16.0608 15.904 16.9671 15.7655 17.6485C15.6312 18.3087 15.4478 18.6548 15.1879 18.8982C14.9281 19.1416 14.5721 19.3009 13.9085 19.3881C13.2237 19.4781 12.3211 19.4796 11.0212 19.4796H9.12641C7.86032 19.4796 6.98218 19.4781 6.31418 19.3915C5.66728 19.3076 5.31727 19.1542 5.05916 18.9193C4.80103 18.6844 4.6142 18.3491 4.4661 17.7094C4.31318 17.0489 4.22325 16.1693 4.09567 14.9009L3.70394 11.0062C3.55063 9.48208 3.44523 8.41706 3.47527 7.61019C3.50451 6.82484 3.66004 6.41286 3.92602 6.11653C4.19199 5.82021 4.58331 5.62291 5.35625 5.51449Z"
                  fill="#FFFFFF"
                ></path>
              </svg>
              <span>삭제하기</span>
            </Button>
            <Button onClick={onEdit}>
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
      </Wrapper>{" "}
      {showEditModal && (
        <ModalBackground onClick={onClose}>
          <EditForm onSubmit={onSave} onClick={(e) => e.stopPropagation()}>
            <ButtonContainer>
              <div className="close-btn" onClick={onClose}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.05024 13.8891C4.75734 14.182 4.75734 14.6568 5.05024 14.9497C5.34313 15.2426 5.818 15.2426 6.1109 14.9497L10 11.0606L13.8891 14.9497C14.182 15.2426 14.6569 15.2426 14.9498 14.9497C15.2427 14.6568 15.2427 14.182 14.9498 13.8891L11.0607 9.99996L14.9497 6.1109C15.2426 5.818 15.2426 5.34313 14.9497 5.05024C14.6568 4.75734 14.182 4.75734 13.8891 5.05024L10 8.9393L6.11095 5.05024C5.81805 4.75734 5.34318 4.75734 5.05029 5.05024C4.75739 5.34313 4.75739 5.818 5.05029 6.1109L8.93935 9.99996L5.05024 13.8891Z"
                    fill="#FFFFFF"
                  ></path>
                </svg>
              </div>
            </ButtonContainer>
            <TextArea
              ref={textareaRef}
              value={updatedPost}
              onChange={onPostChange}
            ></TextArea>
            <ButtonContainer>
              <div>
                <AttachFileButton
                  $isFileUploaded={isFileUploaded}
                  htmlFor="file"
                >
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
                      d="M4.33809 8.03065C4.33809 6.53513 5.55045 5.32277 7.04597 5.32277C8.54149 5.32277 9.75384 6.53513 9.75384 8.03065C9.75384 9.52617 8.54149 10.7385 7.04597 10.7385C5.55045 10.7385 4.33809 9.52617 4.33809 8.03065ZM7.04597 6.7998C6.36619 6.7998 5.81511 7.35087 5.81511 8.03065C5.81511 8.71043 6.36619 9.2615 7.04597 9.2615C7.72575 9.2615 8.27682 8.71043 8.27682 8.03065C8.27682 7.35087 7.72575 6.7998 7.04597 6.7998Z"
                      fill="#8A77FF"
                    ></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.0493 1H9.95073C8.2882 0.999993 6.97362 0.999987 5.92809 1.11326C4.85696 1.22931 3.97154 1.47208 3.21122 2.02448C2.75583 2.35535 2.35535 2.75583 2.02448 3.21122C1.47208 3.97154 1.22931 4.85696 1.11326 5.92809C0.999987 6.97362 0.999993 8.2882 1 9.95073V10.0493C0.999993 11.7118 0.999987 13.0264 1.11326 14.0719C1.22931 15.143 1.47208 16.0285 2.02448 16.7888C2.35535 17.2442 2.75583 17.6447 3.21122 17.9755C3.97154 18.5279 4.85696 18.7707 5.92809 18.8867C6.97362 19 8.28819 19 9.9507 19H10.0493C11.7118 19 13.0264 19 14.0719 18.8867C15.143 18.7707 16.0285 18.5279 16.7888 17.9755C17.2442 17.6447 17.6447 17.2442 17.9755 16.7888C18.5279 16.0285 18.7707 15.143 18.8867 14.0719C19 13.0264 19 11.7118 19 10.0493V9.9507C19 8.28819 19 6.97362 18.8867 5.92809C18.7707 4.85696 18.5279 3.97154 17.9755 3.21122C17.6447 2.75583 17.2442 2.35535 16.7888 2.02448C16.0285 1.47208 15.143 1.22931 14.0719 1.11326C13.0264 0.999987 11.7118 0.999993 10.0493 1ZM4.09366 3.23904C4.5554 2.90357 5.14641 2.70802 6.08981 2.60581C7.04596 2.50221 8.28069 2.50128 10 2.50128C11.7193 2.50128 12.9541 2.50221 13.9102 2.60581C14.8536 2.70802 15.4446 2.90357 15.9064 3.23904C16.2343 3.47731 16.5227 3.76571 16.761 4.09366C17.0965 4.5554 17.292 5.14641 17.3942 6.08981C17.4978 7.04596 17.4988 8.28069 17.4988 10C17.4988 10.2959 17.4987 10.5774 17.4982 10.8456C17.219 10.6693 16.9921 10.5382 16.7641 10.445C15.5408 9.94517 14.1436 10.1372 13.1005 10.9484C12.8265 11.1615 12.5749 11.4468 12.2073 11.8636L11.3416 12.8448C10.7934 13.466 9.86496 13.574 9.18884 13.0951C7.88868 12.1741 6.10199 12.3894 5.05782 13.5929L3.15597 15.7849C2.87078 15.3409 2.69927 14.7729 2.60581 13.9102C2.50221 12.9541 2.50128 11.7193 2.50128 10C2.50128 8.28069 2.50221 7.04596 2.60581 6.08981C2.70802 5.14641 2.90357 4.5554 3.23904 4.09366C3.47731 3.76571 3.76571 3.47731 4.09366 3.23904ZM4.20061 16.8346C4.64671 17.1255 5.21768 17.2997 6.08981 17.3942C7.04596 17.4978 8.28069 17.4988 10 17.4988C11.7193 17.4988 12.9541 17.4978 13.9102 17.3942C14.8536 17.292 15.4446 17.0965 15.9064 16.761C16.2343 16.5227 16.5227 16.2343 16.761 15.9064C17.0965 15.4446 17.292 14.8536 17.3942 13.9102C17.4364 13.5209 17.461 13.0849 17.476 12.5893L17.1329 12.367C16.577 12.007 16.3817 11.8843 16.2054 11.8123C15.4714 11.5124 14.6332 11.6276 14.0073 12.1143C13.8569 12.2313 13.702 12.4021 13.2638 12.8987L12.4491 13.822C11.4015 15.0093 9.6272 15.2156 8.33509 14.3004C7.65476 13.8185 6.71984 13.9311 6.17345 14.5609L4.20061 16.8346Z"
                      fill="#8A77FF"
                    ></path>
                  </svg>
                </AttachFileButton>
                <AttachFileInput
                  onChange={onFileChange}
                  type="file"
                  id="file"
                  accept="image/*"
                />
              </div>
              <SubmitBtn
                $isLoading={isLoading}
                type="submit"
                value={isLoading ? "" : "게시하기"}
              />
            </ButtonContainer>
          </EditForm>
        </ModalBackground>
      )}
    </>
  );
}
