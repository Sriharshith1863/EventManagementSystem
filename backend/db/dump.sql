--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: constraint_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.constraint_type_enum AS ENUM (
    'AGE_LIMIT',
    'MAX_PARTICIPANTS'
);


ALTER TYPE public.constraint_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: event_constraints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_constraints (
    event_id bigint NOT NULL,
    constraint_type public.constraint_type_enum NOT NULL,
    constraint_value bigint NOT NULL
);


ALTER TABLE public.event_constraints OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_event_id_seq OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id bigint DEFAULT nextval('public.events_event_id_seq'::regclass) NOT NULL,
    name character varying(200) NOT NULL,
    venue text NOT NULL,
    cost numeric(10,2) NOT NULL,
    description text,
    datetime timestamp without time zone NOT NULL,
    organizer character varying(100) NOT NULL,
    contact1 character varying(20) NOT NULL,
    contact2 character varying(20),
    email text,
    image text,
    organizer_username character varying(100),
    event_launched boolean DEFAULT false NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tickets_ticket_id_seq OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    ticket_id bigint DEFAULT nextval('public.tickets_ticket_id_seq'::regclass) NOT NULL,
    event_id bigint,
    payment_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cost numeric(10,2) NOT NULL,
    username character varying(100),
    to_display boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    username character varying(100) NOT NULL,
    dob date,
    email character varying(100) NOT NULL,
    password text,
    role character varying(10) NOT NULL,
    profile_image text,
    login_type character varying(10) DEFAULT 'local'::character varying NOT NULL,
    refreshtoken text,
    phone_no character varying(20)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: event_constraints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_constraints (event_id, constraint_type, constraint_value) FROM stdin;
1746945834294	AGE_LIMIT	10
1746945834294	MAX_PARTICIPANTS	11
1746946816722	AGE_LIMIT	11
1746946816722	MAX_PARTICIPANTS	11
1746947326187	AGE_LIMIT	10
1746947326187	MAX_PARTICIPANTS	11
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, name, venue, cost, description, datetime, organizer, contact1, contact2, email, image, organizer_username, event_launched) FROM stdin;
1746945395130	12	12	11.00	\N	2024-11-11 11:11:00	1111	111	\N	\N	/defaultAvatar.webp	12	f
1746945740063	asd	asd	10.00	kojhgfzsdfghj	2024-11-11 11:11:00	asd	1234	\N	\N	/defaultAvatar.webp	12	f
1746945834294	12	12	1011.00	mkjhgf	2011-11-11 11:11:00	11	11	\N	\N	/defaultAvatar.webp	12	f
1746946816722	12	12	11.00	11	0011-11-11 11:11:00	11	11	\N	\N	/defaultAvatar.webp	12	f
1746947326187	12	12	11.00	111	0011-11-11 11:11:00	11	11	\N	\N	/defaultAvatar.webp	12	f
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (ticket_id, event_id, payment_time, cost, username, to_display) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (username, dob, email, password, role, profile_image, login_type, refreshtoken, phone_no) FROM stdin;
12	0011-11-11	12@gmail.com	$2b$10$Ft4hg39VNU1i6ACGiPnRT.DYOtBwxFLy9OxDNLww0/oHziV0gmJ0K	org	\N	local	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjEyIiwiaWF0IjoxNzQ2OTQ1MjU4LCJleHAiOjE3NDc4MDkyNTh9.etPii96u9UZdLmlyChAsSx1bIOHvMoGlNoJfCfk5nEU	12
\.


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 1, false);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 1, false);


--
-- Name: event_constraints event_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_constraints
    ADD CONSTRAINT event_constraints_pkey PRIMARY KEY (event_id, constraint_type);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: event_constraints fk_constraint_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_constraints
    ADD CONSTRAINT fk_constraint_event FOREIGN KEY (event_id) REFERENCES public.events(event_id);


--
-- Name: events fk_event_organizer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_username) REFERENCES public.users(username);


--
-- Name: tickets fk_ticket_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_ticket_event FOREIGN KEY (event_id) REFERENCES public.events(event_id);


--
-- Name: tickets fk_ticket_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_ticket_user FOREIGN KEY (username) REFERENCES public.users(username);


--
-- PostgreSQL database dump complete
--

