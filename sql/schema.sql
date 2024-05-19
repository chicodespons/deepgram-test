CREATE TABLE public.Board (
                              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                              organisation_id text NOT NULL,
                              title text NOT NULL,
                              image_id text NOT NULL,
                              image_thumb_url text,
                              image_full_url text,
                              image_user_name text,
                              image_link_html text,
                              created_at timestamp with time zone DEFAULT now(),
                              updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.TextAreaComponent (
                                          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                                          title text NOT NULL,
                                          description text,
                                          content text,
                                          board_id uuid REFERENCES public.Board(id),
                                          created_at timestamp with time zone DEFAULT now(),
                                          updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_board_id ON public.TextAreaComponent(board_id);
