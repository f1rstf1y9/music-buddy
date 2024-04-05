import { useRef, useState } from "react";
import styled from "styled-components";
import loadingSpinner from "../../public/loading-spinner.gif";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  border: 1px solid #616161;
  border-radius: 10px;
  min-height: 160px;
  padding: 20px;
  background: rgb(255, 255, 255, 0.1);
  background: linear-gradient(
    149deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.1) 29%,
    rgba(246, 244, 255, 0.1) 62%,
    rgba(138, 119, 255, 0.1) 100%
  );
`;

const TextArea = styled.textarea`
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

const ImgPreview = styled.div`
  position: relative;
  width: min-content;
  & > button {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    border: none;
    border-radius: 50%;
    background-color: #1f1f1f;
    &:hover {
      opacity: 0.8;
    }
  }
  & > img {
    width: 150px;
    border-radius: 10px;
    object-fit: cover;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > div {
    display: flex;
    gap: 15px;
    & > div {
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
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

export default function PostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploaded, setFileUploaded] = useState(false);
  const [post, setPost] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const imgRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);

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
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onloadend = () => {
        setImgPreview(reader.result as string);
      };
      setFile(files[0]);
      setFileUploaded(true);
    }
    e.target.value = "";
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || post === "" || post.length > 180) return;

    try {
      setIsLoading(true);
      const doc = await addDoc(collection(db, "posts"), {
        post,
        createAt: Date.now(),
        username: user.displayName || "익명",
        userId: user.uid,
      });
      if (file) {
        const locationRef = ref(
          storage,
          `posts/${user.uid}-${user.displayName}/${doc.id}`
        );
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        updateDoc(doc, {
          photo: url,
        });
      }
      setPost("");
      setImgPreview(null);
      setFile(null);
      setFileUploaded(false);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onFileDelete = () => {
    setImgPreview(null);
    setFile(null);
    setFileUploaded(false);
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        required
        ref={textareaRef}
        onChange={onChange}
        maxLength={180}
        value={post}
        placeholder="어떤 노래를 듣고 있나요?"
      />
      {imgPreview && (
        <ImgPreview>
          <button onClick={onFileDelete}>
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
          </button>
          <img src={imgPreview} />
        </ImgPreview>
      )}
      <ButtonContainer>
        <div>
          <AttachFileButton $isFileUploaded={isFileUploaded} htmlFor="file">
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
            ref={imgRef}
          />
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
                d="M10 2.50523C5.86075 2.50523 2.50523 5.86075 2.50523 10C2.50523 14.1392 5.86075 17.4948 10 17.4948C14.1392 17.4948 17.4948 14.1392 17.4948 10C17.4948 5.86075 14.1392 2.50523 10 2.50523ZM1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10Z"
                fill="#8A77FF"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.85251 4.45255C9.91947 4.86278 9.64119 5.24962 9.23096 5.31657C8.28392 5.47114 7.37553 5.91304 6.64434 6.64423C5.91315 7.37542 5.47126 8.2838 5.31668 9.23085C5.24973 9.64108 4.86289 9.91936 4.45266 9.8524C4.04244 9.78545 3.76416 9.39861 3.83111 8.98838C4.03481 7.74037 4.61842 6.54143 5.57998 5.57987C6.54154 4.61831 7.74048 4.0347 8.9885 3.831C9.39872 3.76405 9.78556 4.04232 9.85251 4.45255Z"
                fill="#8A77FF"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.5474 10.1475C15.1372 10.0805 14.7504 10.3588 14.6834 10.769C14.5289 11.7161 14.087 12.6245 13.3558 13.3557C12.6246 14.0869 11.7162 14.5287 10.7691 14.6833C10.3589 14.7503 10.0806 15.1371 10.1476 15.5473C10.2146 15.9576 10.6014 16.2358 11.0116 16.1689C12.2596 15.9652 13.4586 15.3816 14.4201 14.42C15.3817 13.4585 15.9653 12.2595 16.169 11.0115C16.236 10.6013 15.9577 10.2144 15.5474 10.1475Z"
                fill="#8A77FF"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.99996 8.00357C8.89731 8.00357 8.00344 8.89744 8.00344 10.0001C8.00344 11.1027 8.89731 11.9966 9.99996 11.9966C11.1026 11.9966 11.9965 11.1027 11.9965 10.0001C11.9965 8.89744 11.1026 8.00357 9.99996 8.00357ZM6.49822 10.0001C6.49822 8.06612 8.066 6.49834 9.99996 6.49834C11.9339 6.49834 13.5017 8.06612 13.5017 10.0001C13.5017 11.934 11.9339 13.5018 9.99996 13.5018C8.066 13.5018 6.49822 11.934 6.49822 10.0001Z"
                fill="#8A77FF"
              ></path>
              <path
                d="M10.9164 10.0001C10.9164 10.5062 10.5061 10.9165 9.99999 10.9165C9.49389 10.9165 9.08361 10.5062 9.08361 10.0001C9.08361 9.49401 9.49389 9.08373 9.99999 9.08373C10.5061 9.08373 10.9164 9.49401 10.9164 10.0001Z"
                fill="#8A77FF#"
              ></path>
            </svg>
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
                d="M8.46333 8.38462C8.46333 8.9379 8.01481 9.38643 7.46152 9.38643C6.90824 9.38643 6.45972 8.9379 6.45972 8.38462C6.45972 7.83134 6.90824 7.38281 7.46152 7.38281C8.01481 7.38281 8.46333 7.83134 8.46333 8.38462Z"
                fill="#8A77FF"
              ></path>
              <path
                d="M13.5391 8.38462C13.5391 8.93722 13.0911 9.38519 12.5385 9.38519C11.9859 9.38519 11.5379 8.93722 11.5379 8.38462C11.5379 7.83202 11.9859 7.38405 12.5385 7.38405C13.0911 7.38405 13.5391 7.83202 13.5391 8.38462Z"
                fill="#8A77FF"
              ></path>
              <path
                d="M6.96562 11.8703C6.73389 11.5227 6.26425 11.4288 5.91665 11.6605C5.56905 11.8922 5.47513 12.3619 5.70686 12.7095C7.74921 15.773 12.2509 15.773 14.2932 12.7095C14.525 12.3619 14.4311 11.8922 14.0835 11.6605C13.7359 11.4288 13.2662 11.5227 13.0345 11.8703C11.5909 14.0356 8.40916 14.0356 6.96562 11.8703Z"
                fill="#8A77FF"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM2.51285 10C2.51285 5.86496 5.86496 2.51285 10 2.51285C14.135 2.51285 17.4872 5.86496 17.4872 10C17.4872 14.135 14.135 17.4872 10 17.4872C5.86496 17.4872 2.51285 14.135 2.51285 10Z"
                fill="#8A77FF"
              ></path>
            </svg>
          </div>
        </div>
        <SubmitBtn
          $isLoading={isLoading}
          type="submit"
          value={isLoading ? "" : "게시하기"}
        />
      </ButtonContainer>
    </Form>
  );
}
