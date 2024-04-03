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

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
      setFile(files[0]);
      setFileUploaded(true);
    }
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
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
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
          />
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