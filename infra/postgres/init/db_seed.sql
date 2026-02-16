--
-- PostgreSQL database dump
--

\restrict TZDhOAvP9AHRgG0AZgsztvcQryVC3KuKZZg5VlxuXQJnfHYfMfkKkbnAMFXGP7o

-- Dumped from database version 17.5 (Debian 17.5-1)
-- Dumped by pg_dump version 18.1 (Debian 18.1-2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    description_en text,
    description_ar text,
    image_url text
);


ALTER TABLE public.categories OWNER TO mr_hacker;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO mr_hacker;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: factories; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.factories (
    id integer NOT NULL,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    description_en text NOT NULL,
    description_ar text NOT NULL,
    location_en text NOT NULL,
    location_ar text NOT NULL,
    origin_story_en text NOT NULL,
    origin_story_ar text NOT NULL,
    image_url text NOT NULL,
    logo_url text
);


ALTER TABLE public.factories OWNER TO mr_hacker;

--
-- Name: factories_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.factories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factories_id_seq OWNER TO mr_hacker;

--
-- Name: factories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.factories_id_seq OWNED BY public.factories.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO mr_hacker;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO mr_hacker;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id text NOT NULL,
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO mr_hacker;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO mr_hacker;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    description_en text NOT NULL,
    description_ar text NOT NULL,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2) NOT NULL,
    factory_id integer,
    category_id integer NOT NULL,
    vendor_id character varying,
    image_url text NOT NULL,
    video_url text,
    stock integer DEFAULT 0 NOT NULL,
    specs jsonb,
    expiry_date timestamp without time zone
);


ALTER TABLE public.products OWNER TO mr_hacker;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO mr_hacker;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO mr_hacker;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: mr_hacker
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO mr_hacker;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mr_hacker
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO mr_hacker;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mr_hacker
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    password character varying,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO mr_hacker;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: factories id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.factories ALTER COLUMN id SET DEFAULT nextval('public.factories_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.categories (id, name_en, name_ar, description_en, description_ar, image_url) FROM stdin;
22	Gourmet & Pantry	المأكولات والمؤونة	Artisan flavors.	نكهات حرفية.	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000
23	Beverages	مشروبات	Coffee & Tea.	قهوة وشاي.	https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=1000
24	Superfoods	أطعمة فائقة	Grains & seeds.	حبوب وبذور.	https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000
25	Beauty & cosmetics	الجمال ومستحضرات التجميل	Natural care.	عناية طبيعية.	https://images.unsplash.com/photo-1570172234562-f41c7c5c83ca?q=80&w=1000
26	Health & Pharmacy	الصحة والصيدلية	Wellness.	عافية.	https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1000
27	Fresh Dairy	الألبان الطازجة	Farm direct.	من المزرعة مباشرة.	https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1000
\.


--
-- Data for Name: factories; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.factories (id, name_en, name_ar, description_en, description_ar, location_en, location_ar, origin_story_en, origin_story_ar, image_url, logo_url) FROM stdin;
7	Mediterranean Harvest	حصاد البحر المتوسط	Producers.	منتجون.	Spain	إسبانيا	Tradition.	تقاليد.	https://images.unsplash.com/photo-1474979266404-7eaacbad92c5?q=80&w=1000	\N
8	Alpine Roastery	محمصة جبال الألب	Roasters.	خبراء تحميص.	Swiss	سويسرا	Daily.	يوميا.	https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000	\N
9	Green Valley	جرين فالي	Pure.	نقي.	Greece	اليونان	Nature.	طبيعة.	https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=1000	\N
10	Pure Essence Lab	مختبر بيور إيسنس	Lab.	مختبر.	France	فرنسا	Purity.	نقاء.	https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000	\N
11	Bio-Health	بيو هيلث	Health.	صحة.	Germany	ألمانيا	Science.	علم.	https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=1000	\N
12	Green Farm	مزرعة خضراء	Farm.	مزرعة.	UK	بريطانيا	Fresh.	طازج.	https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
1	1	28	30	20.00
2	2	13	1	35.00
3	2	28	29	20.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.orders (id, user_id, total, status, payment_method, created_at) FROM stdin;
1	d0076e2a-0319-4210-a3b2-6de0c86be943	600.00	pending	cash	2026-02-16 11:03:08.471166
2	877f4b2f-e8f0-4833-b36f-c7517390d908	615.00	pending	cash	2026-02-16 14:58:31.150215
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.products (id, name_en, name_ar, description_en, description_ar, price, original_price, factory_id, category_id, vendor_id, image_url, video_url, stock, specs, expiry_date) FROM stdin;
7	Night Cream	كريم ليلي	Hydrating	مرطب	45.00	120.00	10	25	\N	https://images.unsplash.com/photo-1570172234562-f41c7c5c83ca	\N	100	\N	\N
8	Face Wash	غسول وجه	Gentle	لطيف	18.00	40.00	10	25	\N	https://images.unsplash.com/photo-1556228578-0d85b1a4d521	\N	100	\N	\N
9	Hand Cream	كريم يدين	Shea	شيا	12.00	25.00	10	25	\N	https://images.unsplash.com/photo-1619451422370-e829d46d9551	\N	100	\N	\N
10	Lip Balm	مرطب شفاه	Organic	عضوي	9.00	18.00	10	25	\N	https://images.unsplash.com/photo-1599426903121-689975796858	\N	100	\N	\N
11	Hair Mask	قناع شعر	Argan	أركان	22.00	55.00	10	25	\N	https://images.unsplash.com/photo-1527799822394-465220455dbf	\N	100	\N	\N
12	Body Lotion	لوشن	Coconut	جوز هند	15.00	32.00	10	25	\N	https://images.unsplash.com/photo-1611082216831-7241280d944c	\N	100	\N	\N
14	Olive Oil	زيت زيتون	750ml	٧٥٠مل	24.00	45.00	7	22	\N	https://images.unsplash.com/photo-1474979266404-7eaacbad92c5	\N	100	\N	2026-05-27 08:48:30.929
15	Honey	عسل	500g	٥٠٠جم	18.00	35.00	7	22	\N	https://images.unsplash.com/photo-1587854692152-cbe660dbbb88	\N	100	\N	2026-12-13 08:48:30.929
16	Almond Butter	زبدة لوز	400g	٤٠٠جم	14.00	25.00	9	22	\N	https://images.unsplash.com/photo-1590080873974-9a3dcac5ee9e	\N	100	\N	2026-07-16 08:48:30.929
17	Quinoa	كينوا	1kg	١كجم	15.00	28.00	9	24	\N	https://images.unsplash.com/photo-1512621776951-a57141f2eefd	\N	100	\N	2026-09-04 08:48:30.929
18	Balsamic	خل	200ml	٢٠٠مل	10.00	18.00	7	22	\N	https://images.unsplash.com/photo-1471193945509-9ad0617afabf	\N	100	\N	2026-06-16 08:48:30.929
19	Coffee	قهوة	250g	٢٥٠جم	22.00	42.00	8	23	\N	https://images.unsplash.com/photo-1495474472287-4d71bcdd2085	\N	100	\N	2026-05-17 08:48:30.929
20	Matcha	ماتشا	50g	٥٠جم	30.00	55.00	9	23	\N	https://images.unsplash.com/photo-1582733315328-14ca4ca486ca	\N	100	\N	2026-08-15 08:48:30.929
21	Green Juice	عصير	330ml	٣٣٠مل	7.00	15.00	8	23	\N	https://images.unsplash.com/photo-1613478223719-2ab802602423	\N	100	\N	2026-02-21 08:48:30.929
22	Tea	شاي	100g	١٠٠جم	12.00	22.00	8	23	\N	https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9	\N	100	\N	2027-07-01 08:48:30.929
23	Milk	حليب	1L	١لتر	2.50	4.50	12	27	\N	https://images.unsplash.com/photo-1563636619-e910009355dc	\N	100	\N	2026-02-23 08:48:30.929
24	Goat Cheese	جبن	200g	٢٠٠جم	14.00	28.00	12	27	\N	https://images.unsplash.com/photo-1486297678162-ad2a19b05840	\N	100	\N	2026-03-02 08:48:30.929
25	Bread	خبز	800g	٨٠٠جم	5.00	10.00	12	27	\N	https://images.unsplash.com/photo-1585478259715-876acc5be8eb	\N	100	\N	2026-02-19 08:48:30.929
26	Probiotic	بروبيوتيك	60 caps	٦٠ كبسولة	16.00	35.00	11	26	\N	https://images.unsplash.com/photo-1550572017-edb0e50882e8	\N	100	\N	2027-02-16 08:48:30.929
27	Greek Yogurt	زبادي	500g	٥٠٠جم	6.00	12.00	12	27	\N	https://images.unsplash.com/photo-1488477181946-6428a0291777	\N	100	\N	2026-02-26 08:48:30.929
29	Almond Milk	حليب لوز	1L	١لتر	4.00	8.00	12	27	\N	https://images.unsplash.com/photo-1550583724-b2642d294572	\N	100	\N	2026-02-24 08:48:30.929
30	Tofu	توفو	400g	٤٠٠جم	8.00	15.00	9	24	\N	https://images.unsplash.com/photo-1546069901-ba9599a7e63c	\N	100	\N	2026-03-09 08:48:30.929
31	Chia	شيا	500g	٥٠٠جم	12.00	22.00	9	24	\N	https://images.unsplash.com/photo-1512621776951-a57141f2eefd	\N	100	\N	2027-07-01 08:48:30.929
13	Eye Serum	سيروم عين	Retinol	ريتينول	35.00	85.00	10	25	\N	https://images.unsplash.com/photo-1620916566398-39f1143ab7be	\N	99	\N	\N
28	Vitamin D	فيتامين د	50ml	٥٠ مل	20.00	40.00	11	26	\N	https://images.unsplash.com/photo-1584017911766-d451b3d0e843	\N	41	\N	2027-03-23 08:48:30.929
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.reviews (id, product_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.sessions (sid, sess, expire) FROM stdin;
PCpUK8v8rcYGhPlzRe6HCJIh7VWSzeFP	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-23T09:02:47.261Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "d0076e2a-0319-4210-a3b2-6de0c86be943"}}	2026-02-23 11:03:15
SysF7oLZR5brSEAVPPEQl08pXEP8yYBp	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-23T12:58:08.817Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "877f4b2f-e8f0-4833-b36f-c7517390d908"}}	2026-02-23 15:57:56
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mr_hacker
--

COPY public.users (id, email, first_name, last_name, profile_image_url, password, role, created_at, updated_at) FROM stdin;
d0076e2a-0319-4210-a3b2-6de0c86be943	test@example.com	Test	User	\N	$2b$10$GusUdl9EMtdoXhcwzK5.AupfSe.hPR.uFlBnSKngJqKNcFQLW.RIe	user	2026-02-16 11:02:47.253681	2026-02-16 11:02:47.253681
877f4b2f-e8f0-4833-b36f-c7517390d908	test@test.com	Stacy	A Boone	\N	$2b$10$Oz3nbNiQyqwBbhHX4Fw26OvOzTLSROyI.h7KPgbFcxJm9WgmeF/PS	vendor	2026-02-16 14:58:08.794614	2026-02-16 14:58:08.794614
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.categories_id_seq', 27, true);


--
-- Name: factories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.factories_id_seq', 12, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.order_items_id_seq', 3, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.products_id_seq', 31, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mr_hacker
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: factories factories_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.factories
    ADD CONSTRAINT factories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: mr_hacker
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_factory_id_factories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_factory_id_factories_id_fk FOREIGN KEY (factory_id) REFERENCES public.factories(id);


--
-- Name: products products_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mr_hacker
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TZDhOAvP9AHRgG0AZgsztvcQryVC3KuKZZg5VlxuXQJnfHYfMfkKkbnAMFXGP7o

