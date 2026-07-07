import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NewsFeed } from "./components/NewsFeed";
import { ArticleDetail } from "./components/ArticleDetail";
import { LandingPageWrapper } from "./components/LandingPageWrapper";
import { SavedArticles } from "./components/SavedArticles";
import { ClaimsFeed } from "./components/ClaimsFeed";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPageWrapper },
      { path: "feed", Component: NewsFeed },
      { path: "saved", Component: SavedArticles },
      { path: "article/:id", Component: ArticleDetail },
      { path: "afirmaciones", Component: ClaimsFeed },
    ],
  },
]);