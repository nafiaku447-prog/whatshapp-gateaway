--
-- PostgreSQL database dump
--

\restrict 7iO4DcdyRzJntQJaoQAr6gflEFaLo0vZeBL1jtRpu0sBMPmCEviW9wKcLge3a7K

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-21 16:37:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 245 (class 1255 OID 25969)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 25934)
-- Name: api_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_logs (
    id integer NOT NULL,
    user_id integer,
    device_id integer,
    endpoint character varying(255) NOT NULL,
    method character varying(10) NOT NULL,
    request_body jsonb,
    response_status integer,
    response_time integer,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.api_logs OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 25933)
-- Name: api_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 243
-- Name: api_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.api_logs_id_seq OWNED BY public.api_logs.id;


--
-- TOC entry 238 (class 1259 OID 25861)
-- Name: auto_reply_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auto_reply_rules (
    id integer NOT NULL,
    user_id integer,
    device_id integer,
    name character varying(100) NOT NULL,
    trigger_type character varying(20) NOT NULL,
    keywords jsonb,
    reply_message text NOT NULL,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auto_reply_rules OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25860)
-- Name: auto_reply_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auto_reply_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auto_reply_rules_id_seq OWNER TO postgres;

--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 237
-- Name: auto_reply_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auto_reply_rules_id_seq OWNED BY public.auto_reply_rules.id;


--
-- TOC entry 232 (class 1259 OID 25795)
-- Name: contact_group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_group_members (
    id integer NOT NULL,
    group_id integer,
    contact_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_group_members OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25794)
-- Name: contact_group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_group_members_id_seq OWNER TO postgres;

--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 231
-- Name: contact_group_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_group_members_id_seq OWNED BY public.contact_group_members.id;


--
-- TOC entry 230 (class 1259 OID 25777)
-- Name: contact_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_groups (
    id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_groups OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25776)
-- Name: contact_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_groups_id_seq OWNER TO postgres;

--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 229
-- Name: contact_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_groups_id_seq OWNED BY public.contact_groups.id;


--
-- TOC entry 228 (class 1259 OID 25756)
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    user_id integer,
    name character varying(200) NOT NULL,
    phone_number character varying(20) NOT NULL,
    email character varying(255),
    tags jsonb,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25755)
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO postgres;

--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 227
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- TOC entry 226 (class 1259 OID 25732)
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    user_id integer,
    device_name character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    qr_code text,
    status character varying(20) DEFAULT 'disconnected'::character varying,
    api_token character varying(255) NOT NULL,
    webhook_url character varying(500),
    is_active boolean DEFAULT true,
    last_seen timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25731)
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO postgres;

--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 225
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- TOC entry 234 (class 1259 OID 25816)
-- Name: message_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_templates (
    id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    content text NOT NULL,
    variables jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.message_templates OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25815)
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_templates_id_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 233
-- Name: message_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_templates_id_seq OWNED BY public.message_templates.id;


--
-- TOC entry 236 (class 1259 OID 25835)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    user_id integer,
    device_id integer,
    recipient_phone character varying(20) NOT NULL,
    recipient_name character varying(200),
    message_type character varying(20) NOT NULL,
    content text NOT NULL,
    media_url character varying(500),
    status character varying(20) DEFAULT 'pending'::character varying,
    scheduled_at timestamp without time zone,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25834)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 235
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 222 (class 1259 OID 25692)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    price numeric(10,2) NOT NULL,
    daily_message_limit integer,
    device_limit integer NOT NULL,
    features jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25691)
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 221
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- TOC entry 242 (class 1259 OID 25913)
-- Name: usage_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usage_statistics (
    id integer NOT NULL,
    user_id integer,
    date date NOT NULL,
    messages_sent integer DEFAULT 0,
    messages_received integer DEFAULT 0,
    api_calls integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usage_statistics OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25912)
-- Name: usage_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usage_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usage_statistics_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 241
-- Name: usage_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usage_statistics_id_seq OWNED BY public.usage_statistics.id;


--
-- TOC entry 224 (class 1259 OID 25710)
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id integer NOT NULL,
    user_id integer,
    plan_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25709)
-- Name: user_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_subscriptions_id_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_subscriptions_id_seq OWNED BY public.user_subscriptions.id;


--
-- TOC entry 220 (class 1259 OID 25669)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password_hash character varying(255),
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    verification_token character varying(255),
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(255),
    profile_picture text,
    api_key character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25668)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 240 (class 1259 OID 25888)
-- Name: webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhooks (
    id integer NOT NULL,
    user_id integer,
    device_id integer,
    url character varying(500) NOT NULL,
    events jsonb NOT NULL,
    is_active boolean DEFAULT true,
    secret_key character varying(255),
    last_triggered timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.webhooks OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25887)
-- Name: webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.webhooks_id_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 239
-- Name: webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.webhooks_id_seq OWNED BY public.webhooks.id;


--
-- TOC entry 4966 (class 2604 OID 25937)
-- Name: api_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs ALTER COLUMN id SET DEFAULT nextval('public.api_logs_id_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 25864)
-- Name: auto_reply_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_reply_rules ALTER COLUMN id SET DEFAULT nextval('public.auto_reply_rules_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 25798)
-- Name: contact_group_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_group_members ALTER COLUMN id SET DEFAULT nextval('public.contact_group_members_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 25780)
-- Name: contact_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_groups ALTER COLUMN id SET DEFAULT nextval('public.contact_groups_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 25759)
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 25735)
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- TOC entry 4944 (class 2604 OID 25819)
-- Name: message_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates ALTER COLUMN id SET DEFAULT nextval('public.message_templates_id_seq'::regclass);


--
-- TOC entry 4947 (class 2604 OID 25838)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4922 (class 2604 OID 25695)
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- TOC entry 4960 (class 2604 OID 25916)
-- Name: usage_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_statistics ALTER COLUMN id SET DEFAULT nextval('public.usage_statistics_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 25713)
-- Name: user_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_subscriptions_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 25672)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 25891)
-- Name: webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN id SET DEFAULT nextval('public.webhooks_id_seq'::regclass);


--
-- TOC entry 5220 (class 0 OID 25934)
-- Dependencies: 244
-- Data for Name: api_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_logs (id, user_id, device_id, endpoint, method, request_body, response_status, response_time, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5214 (class 0 OID 25861)
-- Dependencies: 238
-- Data for Name: auto_reply_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auto_reply_rules (id, user_id, device_id, name, trigger_type, keywords, reply_message, is_active, priority, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5208 (class 0 OID 25795)
-- Dependencies: 232
-- Data for Name: contact_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_group_members (id, group_id, contact_id, created_at) FROM stdin;
\.


--
-- TOC entry 5206 (class 0 OID 25777)
-- Dependencies: 230
-- Data for Name: contact_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_groups (id, user_id, name, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5204 (class 0 OID 25756)
-- Dependencies: 228
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, user_id, name, phone_number, email, tags, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5202 (class 0 OID 25732)
-- Dependencies: 226
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, user_id, device_name, phone_number, qr_code, status, api_token, webhook_url, is_active, last_seen, created_at, updated_at) FROM stdin;
35	4	wa	6254647647	data:image/png;base64,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	scanning	37401ec952d6193eba8bede7cfc333a756cd1ae0d9e421547fd258ec6bd17c45	\N	t	2025-12-20 20:07:06.769613	2025-12-20 07:00:39.922234	2025-12-20 20:08:40.706755
40	5	wa	04820823432	\N	connected	2298ea14a22cba549af683acebb0d31590fdfa13f5e09dfbec12bd7b0f5de80d	\N	t	2025-12-21 14:59:04.298427	2025-12-21 14:58:29.396232	2025-12-21 14:59:04.298427
36	3	nazxf	6285813485229	\N	disconnected	5fa4c64e46f6dac35c03b0759e1d91336e52e79abe49eea949fd398af3fb024e	\N	f	2025-12-20 20:18:40.16314	2025-12-20 20:09:18.692722	2025-12-20 20:22:38.841563
\.


--
-- TOC entry 5210 (class 0 OID 25816)
-- Dependencies: 234
-- Data for Name: message_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_templates (id, user_id, name, content, variables, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5212 (class 0 OID 25835)
-- Dependencies: 236
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, user_id, device_id, recipient_phone, recipient_name, message_type, content, media_url, status, scheduled_at, sent_at, delivered_at, read_at, error_message, created_at, updated_at) FROM stdin;
8	5	40	6283110892873	\N	text	Halo dari WA Gateway!	\N	sent	\N	\N	\N	\N	\N	2025-12-21 15:10:35.829244	2025-12-21 15:10:35.829244
9	5	40	6283110892873	\N	text	Halo dari WA Gateway!	\N	sent	\N	\N	\N	\N	\N	2025-12-21 15:10:56.979348	2025-12-21 15:10:56.979348
10	5	40	6283110892873	\N	text	Halo dari WA Gateway!	\N	sent	\N	\N	\N	\N	\N	2025-12-21 15:15:06.672838	2025-12-21 15:15:06.672838
11	5	40	6283110892873	\N	text	Halo dari WA Gateway!	\N	sent	\N	\N	\N	\N	\N	2025-12-21 15:15:57.922662	2025-12-21 15:15:57.922662
\.


--
-- TOC entry 5198 (class 0 OID 25692)
-- Dependencies: 222
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, type, price, daily_message_limit, device_limit, features, is_active, created_at, updated_at) FROM stdin;
1	Free	text_only	0.00	50	1	{"webhook": false, "analytics": false, "text_only": true, "auto_reply": false}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
2	Lite	text_only	25000.00	500	2	{"webhook": false, "analytics": false, "text_only": true, "auto_reply": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
3	Regular	text_only	66000.00	2000	3	{"webhook": true, "analytics": true, "text_only": true, "auto_reply": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
4	Regular Pro	text_only	110000.00	5000	5	{"webhook": true, "analytics": true, "text_only": true, "auto_reply": true, "priority_support": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
5	Master	text_only	175000.00	\N	10	{"webhook": true, "analytics": true, "text_only": true, "unlimited": true, "auto_reply": true, "priority_support": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
6	Super	all_features	165000.00	5000	3	{"webhook": true, "all_media": true, "analytics": true, "auto_reply": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
7	Advanced	all_features	255000.00	15000	5	{"webhook": true, "all_media": true, "analytics": true, "auto_reply": true, "priority_support": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
8	Ultra	all_features	355000.00	\N	10	{"webhook": true, "all_media": true, "analytics": true, "unlimited": true, "auto_reply": true, "custom_features": true, "priority_support": true}	t	2025-12-17 14:36:42.363725	2025-12-17 14:36:42.363725
\.


--
-- TOC entry 5218 (class 0 OID 25913)
-- Dependencies: 242
-- Data for Name: usage_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usage_statistics (id, user_id, date, messages_sent, messages_received, api_calls, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5200 (class 0 OID 25710)
-- Dependencies: 224
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, user_id, plan_id, status, start_date, end_date, created_at, updated_at) FROM stdin;
1	1	1	active	2025-12-17 14:37:52.270357	\N	2025-12-17 14:37:52.270357	2025-12-17 14:37:52.270357
2	2	1	active	2025-12-17 22:06:40.415537	\N	2025-12-17 22:06:40.415537	2025-12-17 22:06:40.415537
3	3	1	active	2025-12-18 05:45:27.659858	\N	2025-12-18 05:45:27.659858	2025-12-18 05:45:27.659858
4	4	1	active	2025-12-20 06:52:54.921504	\N	2025-12-20 06:52:54.921504	2025-12-20 06:52:54.921504
5	5	1	active	2025-12-20 20:17:53.455776	\N	2025-12-20 20:17:53.455776	2025-12-20 20:17:53.455776
6	6	1	active	2025-12-20 20:44:09.415169	\N	2025-12-20 20:44:09.415169	2025-12-20 20:44:09.415169
\.


--
-- TOC entry 5196 (class 0 OID 25669)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, phone, password_hash, is_active, is_verified, verification_token, reset_password_token, reset_password_expires, created_at, updated_at, google_id, profile_picture, api_key) FROM stdin;
1	Budi	Santoso	budisantoso@gmail.com	628987654321	$2a$10$cXcEUwzptALlA//vDFIUaOcgTxH1/gxuOhIFVp4LEFC..VPmUF9Vu	t	f	\N	\N	\N	2025-12-17 14:37:52.259123	2025-12-19 20:36:28.887702	\N	\N	wa_live_2594bd93f62dcc92bee5fc5471195caf07c1f7feb3eb4fed
2	Aku	Nafi	nafiaku447@gmail.com		$2a$10$aDu.AJnrox82YOQyI74xrOSCpTg5OFukvA57T6d5oov1i/AwXRBY2	t	t	\N	\N	\N	2025-12-17 22:06:40.387741	2025-12-19 20:36:28.89519	103514806101959329308	https://lh3.googleusercontent.com/a/ACg8ocIpKDbj7T43Homxx9z5E-1BkQ2j_iKnGKw_PaWcmfJZsPCbwg=s96-c	wa_live_78a356a290eab1d6de30e9a01d3b95f6d26b2736ba24d15b
3	KURAMANAFI	HOSSAIN	kuramanafi231@gmail.com		$2a$10$jVInsVDsw4hX7ZaZatObKeQGEfAQ/piroc5KVWap8oU5/uyUrWye.	t	t	\N	\N	\N	2025-12-18 05:45:27.632512	2025-12-19 21:37:22.375472	110393598260253187860	http://localhost:5000/uploads/avatars/user-3-1766155042368.jpg	wa_live_e42bd1d703842545224cd5ef3e0577c0f10a5c9e3b717ddf
4	WIRDA	NASUTION	adh1321@gmail.com	08773507622	$2a$10$Hilm6xyiV8GKKbmg6x2rRuivtCwoc3KGtVMJUP3RmcpLN1Era10Uy	t	f	\N	\N	\N	2025-12-20 06:52:54.886136	2025-12-21 14:11:26.402008	\N	http://localhost:5000/uploads/avatars/user-4-1766188385409.jpg	wa_live_d74bcf0db1faf6f33d5cd4c444829efa80ccc55c86617979
5	nasi	alpjha	admin@school.com	4141241321	$2a$10$9B2U7l/Xdx2PibaYcjTdfel2u3CAbFLsjIDT/k7RwRgrN6u8Gv8r.	t	f	\N	\N	\N	2025-12-20 20:17:53.442986	2025-12-21 14:11:26.430417	\N	\N	wa_live_f9174b09c1041c900964648b57cc93da6611de8189fb599f
6	Admin	WA Gateway	admin@wagateway.com	6281234567890	$2a$10$Zkr/SG8nmJdDQKLNtbPjVOJVceesPUe.W5MmPU8uYmCIjjZLbjGPO	t	f	\N	\N	\N	2025-12-20 20:44:09.395807	2025-12-21 14:11:26.433507	\N	\N	wa_live_4862b39c4e2ba011e45b156493c9c54c5f0a97d7ddeda20c
\.


--
-- TOC entry 5216 (class 0 OID 25888)
-- Dependencies: 240
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhooks (id, user_id, device_id, url, events, is_active, secret_key, last_triggered, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 243
-- Name: api_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_logs_id_seq', 1, false);


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 237
-- Name: auto_reply_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auto_reply_rules_id_seq', 1, false);


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 231
-- Name: contact_group_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_group_members_id_seq', 1, false);


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 229
-- Name: contact_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_groups_id_seq', 1, false);


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 227
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 225
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 40, true);


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 233
-- Name: message_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_templates_id_seq', 1, false);


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 235
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 11, true);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 221
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 8, true);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 241
-- Name: usage_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usage_statistics_id_seq', 1, false);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_subscriptions_id_seq', 6, true);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 239
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 1, false);


--
-- TOC entry 5017 (class 2606 OID 25945)
-- Name: api_logs api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 25876)
-- Name: auto_reply_rules auto_reply_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_reply_rules
    ADD CONSTRAINT auto_reply_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 25804)
-- Name: contact_group_members contact_group_members_group_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_group_members
    ADD CONSTRAINT contact_group_members_group_id_contact_id_key UNIQUE (group_id, contact_id);


--
-- TOC entry 4998 (class 2606 OID 25802)
-- Name: contact_group_members contact_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_group_members
    ADD CONSTRAINT contact_group_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 25788)
-- Name: contact_groups contact_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_groups
    ADD CONSTRAINT contact_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 25768)
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 25770)
-- Name: contacts contacts_user_id_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_id_phone_number_key UNIQUE (user_id, phone_number);


--
-- TOC entry 4982 (class 2606 OID 25749)
-- Name: devices devices_api_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_api_token_key UNIQUE (api_token);


--
-- TOC entry 4984 (class 2606 OID 25747)
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 25828)
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 25849)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 25708)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 25925)
-- Name: usage_statistics usage_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_statistics
    ADD CONSTRAINT usage_statistics_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 25927)
-- Name: usage_statistics usage_statistics_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_statistics
    ADD CONSTRAINT usage_statistics_user_id_date_key UNIQUE (user_id, date);


--
-- TOC entry 4980 (class 2606 OID 25720)
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 25688)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4974 (class 2606 OID 25983)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4976 (class 2606 OID 25686)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 25901)
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 1259 OID 25968)
-- Name: idx_api_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_logs_created_at ON public.api_logs USING btree (created_at);


--
-- TOC entry 5019 (class 1259 OID 25967)
-- Name: idx_api_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_logs_user_id ON public.api_logs USING btree (user_id);


--
-- TOC entry 4991 (class 1259 OID 25965)
-- Name: idx_contacts_phone_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_phone_number ON public.contacts USING btree (phone_number);


--
-- TOC entry 4992 (class 1259 OID 25964)
-- Name: idx_contacts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_user_id ON public.contacts USING btree (user_id);


--
-- TOC entry 4985 (class 1259 OID 25959)
-- Name: idx_devices_api_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_api_token ON public.devices USING btree (api_token);


--
-- TOC entry 4986 (class 1259 OID 25958)
-- Name: idx_devices_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_user_id ON public.devices USING btree (user_id);


--
-- TOC entry 5001 (class 1259 OID 25963)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- TOC entry 5002 (class 1259 OID 25961)
-- Name: idx_messages_device_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_device_id ON public.messages USING btree (device_id);


--
-- TOC entry 5003 (class 1259 OID 25962)
-- Name: idx_messages_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_status ON public.messages USING btree (status);


--
-- TOC entry 5004 (class 1259 OID 25960)
-- Name: idx_messages_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);


--
-- TOC entry 5011 (class 1259 OID 25966)
-- Name: idx_usage_statistics_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usage_statistics_user_date ON public.usage_statistics USING btree (user_id, date);


--
-- TOC entry 4968 (class 1259 OID 26042)
-- Name: idx_users_api_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_api_key ON public.users USING btree (api_key);


--
-- TOC entry 4969 (class 1259 OID 25956)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4970 (class 1259 OID 25957)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 5045 (class 2620 OID 25978)
-- Name: auto_reply_rules update_auto_reply_rules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_auto_reply_rules_updated_at BEFORE UPDATE ON public.auto_reply_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5042 (class 2620 OID 25975)
-- Name: contact_groups update_contact_groups_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contact_groups_updated_at BEFORE UPDATE ON public.contact_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5041 (class 2620 OID 25974)
-- Name: contacts update_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5040 (class 2620 OID 25973)
-- Name: devices update_devices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5043 (class 2620 OID 25976)
-- Name: message_templates update_message_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5044 (class 2620 OID 25977)
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5038 (class 2620 OID 25971)
-- Name: subscription_plans update_subscription_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5047 (class 2620 OID 25980)
-- Name: usage_statistics update_usage_statistics_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_usage_statistics_updated_at BEFORE UPDATE ON public.usage_statistics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5039 (class 2620 OID 25972)
-- Name: user_subscriptions update_user_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5037 (class 2620 OID 25970)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5046 (class 2620 OID 25979)
-- Name: webhooks update_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5035 (class 2606 OID 25951)
-- Name: api_logs api_logs_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- TOC entry 5036 (class 2606 OID 25946)
-- Name: api_logs api_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 25882)
-- Name: auto_reply_rules auto_reply_rules_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_reply_rules
    ADD CONSTRAINT auto_reply_rules_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 25877)
-- Name: auto_reply_rules auto_reply_rules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_reply_rules
    ADD CONSTRAINT auto_reply_rules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5025 (class 2606 OID 25810)
-- Name: contact_group_members contact_group_members_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_group_members
    ADD CONSTRAINT contact_group_members_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 5026 (class 2606 OID 25805)
-- Name: contact_group_members contact_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_group_members
    ADD CONSTRAINT contact_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.contact_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5024 (class 2606 OID 25789)
-- Name: contact_groups contact_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_groups
    ADD CONSTRAINT contact_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 25771)
-- Name: contacts contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 25750)
-- Name: devices devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5027 (class 2606 OID 25829)
-- Name: message_templates message_templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 25855)
-- Name: messages messages_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 25850)
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 25928)
-- Name: usage_statistics usage_statistics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_statistics
    ADD CONSTRAINT usage_statistics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5020 (class 2606 OID 25726)
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- TOC entry 5021 (class 2606 OID 25721)
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 25907)
-- Name: webhooks webhooks_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- TOC entry 5033 (class 2606 OID 25902)
-- Name: webhooks webhooks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-12-21 16:37:33

--
-- PostgreSQL database dump complete
--

\unrestrict 7iO4DcdyRzJntQJaoQAr6gflEFaLo0vZeBL1jtRpu0sBMPmCEviW9wKcLge3a7K

