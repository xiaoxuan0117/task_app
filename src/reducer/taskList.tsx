import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TaskProps,
  TaskListStatus,
  Filter,
  GetTaskListPayload,
  GetTaskListParams,
  GetTaskListResData,
  UpdateStatePayload,
  UpdateTaskParams,
} from "../type";
import axios from "axios";
import { AppDispatch } from "../store";

const initialState: TaskListStatus = {
  isLoading: false,
  taskList: [],
  page: 1,
  errMsg: "",
  isAll: false,
  filter: {
    state: "all",
    labels: "",
    category: "assigned",
    direction: "asc",
  },
  isStateLoading: false,
  taskSearchKeyword: "",
  isSearchMode: false,
};

export const ScrollToButtom = createAsyncThunk<
  boolean,
  undefined,
  {
    dispatch: AppDispatch;
    state: {
      taskList: { isAll: boolean; isLoading: boolean; isSearchMode: boolean };
    };
  }
>("taskList/scrollToBottom", async (_, { getState, dispatch }) => {
  const { isAll, isLoading, isSearchMode } = getState().taskList;
  if (!isAll && !isLoading) {
    await dispatch(GetTaskList({ reLoad: false }));
    if (isSearchMode) {
      dispatch(taskSearch());
    }
  }
  return true;
});

export const GetTaskList = createAsyncThunk<
  GetTaskListPayload,
  GetTaskListParams,
  {
    state: {
      taskList: {
        page: number;
        filter: Filter;
      };
    };
  }
>("taskList/getTaskList", async ({ reLoad }, { getState, rejectWithValue }) => {
  const {
    page,
    filter: { state, labels, category, direction },
  } = getState().taskList;

  try {
    const resData = await axios({
      url: "/api/taskList",
      method: "get",
      params: {
        page: reLoad ? 1 : page,
        state: state,
        labels: labels === "all" ? "" : labels,
        category: category,
        direction: direction,
      },
    });
    console.log(resData.data);
    const issueData: TaskProps[] = resData.data.map(
      (issue: GetTaskListResData) => {
        const {
          assignee,
          created_at,
          html_url,
          id,
          labels,
          number,
          repository,
          state,
          title,
          user,
          body,
        } = issue;
        const { avatar_url, html_url: assignee_url } = assignee || {};
        const { name: repository_name, html_url: repo_url } = repository || {};
        const { login, html_url: creatorUrl } = user || {};
        const labels_arr = labels.map((label) => label.name);
        return {
          assigneeAvatar: avatar_url,
          assigneeUrl: assignee_url,
          body,
          time: created_at,
          issueUrl: html_url,
          id,
          labels: labels_arr,
          number,
          repo: repository_name,
          repoUrl: repo_url,
          isOpen: state === "open" ? true : false,
          title: title,
          creator: login,
          creatorUrl,
          isSearchResult: false,
        };
      }
    );

    console.log("almost", issueData);
    return {
      error: false,
      issueData,
      errMsg: "",
      page: issueData.length < 10 ? 0 : 1,
      isAll: issueData.length < 10 ? true : false,
      reLoad,
    };
  } catch (err: any) {
    const {
      response: {
        status,
        data: { message },
      },
    } = err;
    return rejectWithValue(`status: ${status} / error message: ${message}`);
  }
});

export const setFilter = createAsyncThunk<
  boolean,
  { type: string; option: string },
  {
    dispatch: AppDispatch;
    state: { taskList: { isLoading: boolean } };
  }
>("taskList/setFilter", async ({ type, option }, thunkApi) => {
  const { isLoading } = thunkApi.getState().taskList;
  console.log("type, option", type, option);

  thunkApi.dispatch(changeFilterState({ type, option }));
  if (!isLoading) {
    await thunkApi.dispatch(GetTaskList({ reLoad: true }));
  }
  return true;
});

export const UpdateState = createAsyncThunk<
  UpdateStatePayload,
  UpdateTaskParams,
  {
    state: { taskList: { taskList: TaskProps[] } };
  }
>(
  "task/updateState",
  async ({ owner, repo, number }, { getState, rejectWithValue }) => {
    const { taskList } = getState().taskList;
    const taskIndex = taskList.findIndex((task) => {
      return (
        task.creator === owner && task.repo === repo && task.number === number
      );
    });
    const currentState = taskList[taskIndex].isOpen;
    if (taskIndex === -1) {
      console.log(taskIndex);
      return rejectWithValue("no task found");
    }

    try {
      const resData = await axios({
        url: "api/updateState",
        method: "get",
        params: {
          owner: owner,
          repo: repo,
          issue_number: number,
          state: !currentState ? "open" : "closed",
        },
      });

      return { taskIndex, state: resData.data === "open" ? true : false };
    } catch (err: any) {
      const {
        response: {
          status,
          data: { message },
        },
      } = err;
      return rejectWithValue(`status: ${status} / error message: ${message}`);
    }
  }
);

export const taskListSlice = createSlice({
  name: "taskList",
  initialState,
  reducers: {
    changeFilterState(
      state,
      action: PayloadAction<{ type: string; option: string }>
    ) {
      state.filter = {
        ...state.filter,
        [action.payload.type]: action.payload.option,
      };
    },
    setTaskSearchKeyword(state, action: PayloadAction<string>) {
      state.taskSearchKeyword = action.payload;
    },
    taskSearch(state) {
      if (state.taskSearchKeyword) {
        const keyword = new RegExp(`${state.taskSearchKeyword}`, "i");
        const result = state.taskList.map((task) => {
          if (
            keyword.test(task.repo) ||
            keyword.test(task.title) ||
            keyword.test(task.body)
          ) {
            return { ...task, isSearchResult: true };
          } else {
            return { ...task, isSearchResult: false };
          }
        });
        state.taskList = result;
        state.isSearchMode = true;
      } else {
        state.isSearchMode = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetTaskList.pending, (state, action) => {
        state.isLoading = true;
        if (action.meta.arg.reLoad) {
          state.taskList = [];
          state.page = 1;
          state.isAll = false;
        }
        return state;
      })
      .addCase(GetTaskList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errMsg = action.payload.errMsg;
        state.taskList.push(...(action.payload.issueData || []));
        state.page = state.page + action.payload.page;
        state.isAll = action.payload.isAll;
        return state;
      })
      .addCase(GetTaskList.rejected, (state, action) => {
        state.isLoading = false;
        state.errMsg = `sorry! something went wrong! ${action.payload}`;
        state.taskList = [];
        return state;
      })
      .addCase(ScrollToButtom.fulfilled, (state, action) => {
        return state;
      })
      .addCase(setFilter.pending, (state) => {
        state.taskSearchKeyword = "";
        state.isSearchMode = false;
      })
      .addCase(UpdateState.pending, (state, action) => {
        state.isStateLoading = true;
      })
      .addCase(UpdateState.fulfilled, (state, action) => {
        state.isStateLoading = false;
        state.taskList[action.payload.taskIndex].isOpen = action.payload.state;
      })
      .addCase(UpdateState.rejected, (state, action) => {
        state.isStateLoading = false;
        state.errMsg = `sorry! something went wrong! ${action.payload}`;
        return state;
      });
  },
});

export const { changeFilterState, setTaskSearchKeyword, taskSearch } =
  taskListSlice.actions;

export default taskListSlice.reducer;
