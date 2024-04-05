import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Post from "./post";
import { Unsubscribe } from "firebase/auth";

export interface IPost {
  id: string;
  photo: string;
  post: string;
  userId: string;
  username: string;
  createAt: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  overflow-y: scroll;
  width: 45vw;
  height: 100%;
`;

export default function TimeLine() {
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createAt", "desc"),
        limit(25)
      );

      unsubscribe = await onSnapshot(postsQuery, (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
          const { post, createAt, userId, username, photo } = doc.data();
          return {
            post,
            createAt,
            userId,
            username,
            photo,
            id: doc.id,
          };
        });
        setPosts(posts);
      });
    };
    fetchPosts();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);
  return (
    <Wrapper>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </Wrapper>
  );
}
